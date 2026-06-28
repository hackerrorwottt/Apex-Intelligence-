"""
RAG ENGINE
----------
Knowledge Base: Finance Books / SEBI Regulations / Annual Reports /
Research Papers / User Uploaded PDFs
Pipeline: PDF -> Chunking -> Embedding -> ChromaDB -> Semantic Search ->
Relevant Chunks

Design notes (lessons learned the hard way, kept here so they aren't
re-broken later):

1. Embedding choice: a custom TF-IDF embedding function instead of
   ChromaDB's bundled sentence-transformers model. The bundled model is
   downloaded from the internet on first use, which fails in any
   network-restricted environment (sandboxes, locked-down corporate
   networks, bad demo-day wifi). TF-IDF is a legitimate, real embedding
   method with zero external downloads, at the cost of being lexical
   rather than deep-semantic.

2. Distance metric: ChromaDB's default index metric is squared L2
   (Euclidean), NOT cosine similarity. Raw TF-IDF vectors are sparse and
   vary in magnitude by how many terms a chunk shares with the
   vocabulary, so plain L2 distance is dominated by vector magnitude, not
   direction -> bad rankings. Fix: L2-normalize every embedding to unit
   length before it goes into Chroma. On unit vectors, squared Euclidean
   distance and cosine similarity are monotonically related:
       cos_sim = 1 - (L2_distance^2) / 2
   so we can recover a proper similarity score from Chroma's raw
   distances.

3. Vocabulary lifecycle: a TfidfVectorizer must be FIT on a fixed
   vocabulary, then reused (transform-only) for every later embedding
   call, including queries. Earlier mistakes to never repeat:
     - refitting on every __call__ (including queries) makes the
       vocabulary drift, so a query embedded "now" is not comparable to
       a document embedded "earlier" against a different vocabulary
     - fitting once on a small seed corpus and freezing forever makes any
       term that appears only in a later user-uploaded document (or even
       in a query) map to an all-zero vector, since it's outside the
       known vocabulary
   The correct lifecycle implemented below: keep the raw text of every
   chunk ever indexed. Whenever new documents are added, refit the
   vectorizer on the FULL accumulated corpus and re-embed + re-upsert
   everything into Chroma. Queries always reuse the most recently fitted
   vectorizer (transform-only, never refit).
"""
import hashlib
import json
import re
import uuid
from pathlib import Path

from typing import Optional

import numpy as np
import chromadb
from chromadb.api.types import EmbeddingFunction, Embeddings, Documents
from sklearn.feature_extraction.text import TfidfVectorizer

from app.core.config import settings, CHROMA_DIR, KB_DIR
from app.core.logging_config import logger


def _l2_normalize(matrix: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return matrix / norms


class _FrozenTfidfEmbeddingFunction(EmbeddingFunction):
    """
    ChromaDB-compatible embedding function wrapping a TfidfVectorizer that
    is fit externally (by RAGEngine, on the full corpus) and only ever
    used here in transform-only mode. This guarantees query embeddings and
    stored document embeddings are always projected through the same
    fitted vocabulary.
    """

    def __init__(self, vectorizer: TfidfVectorizer):
        self.vectorizer = vectorizer

    def __call__(self, input: Documents) -> Embeddings:
        matrix = self.vectorizer.transform(input).toarray()
        matrix = _l2_normalize(matrix)
        return matrix.tolist()


class RAGEngine:
    """
    Retrieval-Augmented Generation engine over a small finance knowledge
    base (seed docs + user uploads), using TF-IDF + ChromaDB.
    """

    CHUNK_SIZE_CHARS = 700
    CHUNK_OVERLAP_CHARS = 100
    VECTORIZER_STATE_PATH = CHROMA_DIR / "tfidf_state.json"
    RAW_CORPUS_PATH = CHROMA_DIR / "raw_corpus.json"

    def __init__(self):
        self.client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.vectorizer: Optional[TfidfVectorizer] = None
        # raw_corpus: list of {"id": chunk_id, "text": ..., "metadata": {...}}
        self.raw_corpus: list[dict] = []
        self._load_state()
        self._ensure_collection()

        if not self.raw_corpus:
            self._seed_from_knowledge_base_dir()

    # ------------------------------------------------------------------ #
    # Setup / persistence
    # ------------------------------------------------------------------ #
    def _ensure_collection(self):
        embed_fn = self._current_embed_fn()
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION,
            embedding_function=embed_fn,
            metadata={"hnsw:space": "l2"},
        )

    def _current_embed_fn(self):
        if self.vectorizer is None:
            # Bootstrap vectorizer on whatever raw corpus we have (possibly
            # empty at first construction); refit_and_reindex will replace
            # this once real text exists.
            texts = [c["text"] for c in self.raw_corpus] or ["placeholder"]
            self.vectorizer = TfidfVectorizer(max_features=2048, stop_words="english")
            self.vectorizer.fit(texts)
        return _FrozenTfidfEmbeddingFunction(self.vectorizer)

    def _load_state(self):
        if self.RAW_CORPUS_PATH.exists():
            with open(self.RAW_CORPUS_PATH) as f:
                self.raw_corpus = json.load(f)
        if self.VECTORIZER_STATE_PATH.exists():
            try:
                vocab = json.loads(self.VECTORIZER_STATE_PATH.read_text())["vocabulary"]
                vec = TfidfVectorizer(max_features=2048, stop_words="english", vocabulary=vocab)
                # A vectorizer restored with a fixed vocabulary still needs
                # idf weights; refit on the raw corpus text to populate them
                # using the same vocabulary (deterministic, since vocabulary
                # is fixed).
                if self.raw_corpus:
                    vec.fit([c["text"] for c in self.raw_corpus])
                self.vectorizer = vec
            except Exception as e:
                logger.warning(f"[RAG] could not restore vectorizer state, will refit: {e}")
                self.vectorizer = None

    def _persist_state(self):
        self.RAW_CORPUS_PATH.write_text(json.dumps(self.raw_corpus))
        if self.vectorizer is not None:
            vocab = {k: int(v) for k, v in self.vectorizer.vocabulary_.items()}
            self.VECTORIZER_STATE_PATH.write_text(
                json.dumps({"vocabulary": vocab})
            )

    def _seed_from_knowledge_base_dir(self):
        """Index the sample finance/SEBI/annual-report .txt files on first run."""
        seed_files = sorted(KB_DIR.glob("*.txt"))
        if not seed_files:
            logger.warning("[RAG] no seed knowledge base files found in app/data/knowledge_base")
            return
        for path in seed_files:
            text = path.read_text(encoding="utf-8", errors="ignore")
            self.index_document(text=text, source_name=path.name, doc_type="seed_knowledge_base", _defer_persist=True)
        self._refit_and_reindex()
        logger.info(f"[RAG] seeded knowledge base with {len(seed_files)} documents, "
                    f"{len(self.raw_corpus)} chunks total")

    # ------------------------------------------------------------------ #
    # Chunking
    # ------------------------------------------------------------------ #
    @classmethod
    def _chunk_text(cls, text: str) -> list[str]:
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            return []
        chunks = []
        start = 0
        n = len(text)
        step = cls.CHUNK_SIZE_CHARS - cls.CHUNK_OVERLAP_CHARS
        while start < n:
            end = min(start + cls.CHUNK_SIZE_CHARS, n)
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            if end == n:
                break
            start += step
        return chunks

    # ------------------------------------------------------------------ #
    # Indexing
    # ------------------------------------------------------------------ #
    def index_document(self, text: str, source_name: str, doc_type: str = "user_upload",
                        _defer_persist: bool = False) -> dict:
        """
        Chunks `text`, appends chunks to the raw corpus, and (unless
        _defer_persist, used only during initial seeding) refits the
        vectorizer on the full accumulated corpus and re-indexes everything
        into ChromaDB. Returns {doc_id, chunks_indexed}.
        """
        doc_id = str(uuid.uuid4())[:8]
        chunks = self._chunk_text(text)
        for i, chunk_text in enumerate(chunks):
            chunk_id = f"{doc_id}_{i}"
            self.raw_corpus.append({
                "id": chunk_id,
                "text": chunk_text,
                "metadata": {
                    "doc_id": doc_id,
                    "source": source_name,
                    "doc_type": doc_type,
                    "chunk_index": i,
                },
            })

        if not _defer_persist:
            self._refit_and_reindex()

        logger.info(f"[RAG] indexed '{source_name}' -> {len(chunks)} chunks (doc_id={doc_id})")
        return {"doc_id": doc_id, "filename": source_name, "chunks_indexed": len(chunks)}

    def index_pdf_bytes(self, pdf_bytes: bytes, filename: str) -> dict:
        """Extracts text from an uploaded PDF and indexes it."""
        text = self._extract_pdf_text(pdf_bytes)
        if not text.strip():
            raise ValueError(f"No extractable text found in {filename}")
        return self.index_document(text=text, source_name=filename, doc_type="user_upload_pdf")

    @staticmethod
    def _extract_pdf_text(pdf_bytes: bytes) -> str:
        try:
            from pypdf import PdfReader
            import io
            reader = PdfReader(io.BytesIO(pdf_bytes))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except ImportError:
            logger.error("[RAG] pypdf not installed; cannot extract PDF text")
            raise

    def _refit_and_reindex(self):
        """
        Refits the TF-IDF vectorizer on the FULL accumulated raw corpus,
        then re-embeds and re-upserts every chunk into ChromaDB. This is
        the only place the vectorizer is ever fit (never inside the
        embedding function's __call__, which is transform-only).
        """
        if not self.raw_corpus:
            return
        texts = [c["text"] for c in self.raw_corpus]
        self.vectorizer = TfidfVectorizer(max_features=2048, stop_words="english")
        self.vectorizer.fit(texts)

        # Recreate the collection bound to the freshly-fit vectorizer, then
        # bulk-upsert all chunks (cheap at this knowledge-base scale).
        try:
            self.client.delete_collection(settings.CHROMA_COLLECTION)
        except Exception:
            pass
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION,
            embedding_function=_FrozenTfidfEmbeddingFunction(self.vectorizer),
            metadata={"hnsw:space": "l2"},
        )

        ids = [c["id"] for c in self.raw_corpus]
        metadatas = [c["metadata"] for c in self.raw_corpus]
        self.collection.add(ids=ids, documents=texts, metadatas=metadatas)
        self._persist_state()

    # ------------------------------------------------------------------ #
    # Retrieval
    # ------------------------------------------------------------------ #
    def search(self, query: str, top_k: int = 3) -> list[dict]:
        """
        Returns up to top_k relevant chunks: [{text, source, score, doc_type}],
        sorted by descending relevance (cosine similarity, recovered from
        ChromaDB's raw L2 distance on L2-normalized vectors).
        """
        if not self.raw_corpus:
            return []
        n_results = min(top_k, len(self.raw_corpus))
        results = self.collection.query(query_texts=[query], n_results=n_results)

        out = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        dists = results.get("distances", [[]])[0]
        for doc, meta, dist in zip(docs, metas, dists):
            # vectors are L2-normalized -> squared L2 distance d^2 relates
            # to cosine similarity by: cos_sim = 1 - d^2/2
            cos_sim = 1 - (dist / 2)
            out.append({
                "text": doc,
                "source": meta.get("source"),
                "doc_type": meta.get("doc_type"),
                "relevance_score": round(float(np.clip(cos_sim, -1, 1)), 4),
            })
        out.sort(key=lambda r: r["relevance_score"], reverse=True)
        return out

    def search_for_ticker_context(self, ticker: str, fundamentals_summary: str, top_k: int = 3) -> list[dict]:
        """Convenience wrapper: builds a query from a ticker + fundamentals blurb."""
        query = f"{ticker} {fundamentals_summary}"
        return self.search(query, top_k=top_k)

    def index_file(self, file_path: str, source_name: str) -> dict:
        """
        Index a file (PDF or plain text) from disk into ChromaDB.
        Returns {doc_id, chunks_indexed}.
        Used by the RAG upload router.
        """
        import uuid as _uuid
        import os

        ext = os.path.splitext(file_path)[1].lower()
        doc_id = str(_uuid.uuid4())

        if ext == ".pdf":
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            result = self.index_pdf_bytes(pdf_bytes, filename=source_name)
            return {"doc_id": doc_id, "chunks_indexed": result.get("chunks_indexed", 0)}
        else:
            # Plain text / markdown
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                text = f.read()
            result = self.index_document(text, source_name=source_name, doc_type="user_upload")
            return {"doc_id": doc_id, "chunks_indexed": result.get("chunks_indexed", 0)}

    def get_stats(self) -> dict:
        """Return basic stats about the knowledge base."""
        total_chunks = len(self.raw_corpus)
        sources = list({item.get("source", "unknown") for item in self.raw_corpus})
        return {
            "total_chunks": total_chunks,
            "unique_sources": len(sources),
            "sources": sources[:20],  # cap list for readability
        }


rag_engine = RAGEngine()
