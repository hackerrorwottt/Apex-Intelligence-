"""
RAG ROUTER
----------
POST /api/rag/upload
  - Accepts PDF or text file upload
  - Indexes it into ChromaDB via RAGEngine
  - Returns doc_id, filename, chunks_indexed

POST /api/rag/search
  - Direct semantic search against the knowledge base

GET  /api/rag/stats
  - Returns number of documents and chunks in the knowledge base
"""
from __future__ import annotations

import os
import tempfile

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.engines.rag_engine import rag_engine
from app.schemas.profile import RAGUploadResponse
from app.schemas.responses import RAGSearchResponse, RAGSearchResult
from app.core.logging_config import logger

router = APIRouter(prefix="/api/rag", tags=["RAG"])

_ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}
_MAX_FILE_SIZE_MB = 20


@router.post("/upload", response_model=RAGUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF or text file to the RAG knowledge base.
    The file is chunked, embedded, and indexed into ChromaDB.
    """
    filename = file.filename or "upload.txt"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext}'. Allowed: {_ALLOWED_EXTENSIONS}",
        )

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > _MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Max allowed: {_MAX_FILE_SIZE_MB} MB.",
        )

    logger.info(f"[Router/rag] uploading file='{filename}' size={size_mb:.2f}MB")

    try:
        # Write to a temp file so rag_engine can read it (supports PDF binary)
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        result = rag_engine.index_file(tmp_path, source_name=filename)
        os.unlink(tmp_path)

        return RAGUploadResponse(
            doc_id=result["doc_id"],
            filename=filename,
            chunks_indexed=result["chunks_indexed"],
        )

    except Exception as exc:
        logger.error(f"[Router/rag] upload error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Indexing failed: {exc}")


@router.post("/search", response_model=RAGSearchResponse)
async def search(
    query: str = Query(..., min_length=3, description="Semantic search query"),
    top_k: int = Query(default=5, ge=1, le=20),
    ticker: str = Query(default="", description="Optional ticker to scope the query"),
):
    """Semantic search against the RAG knowledge base."""
    full_query = f"{ticker} {query}".strip() if ticker else query
    logger.info(f"[Router/rag] search query='{full_query}' top_k={top_k}")

    try:
        hits = rag_engine.search(full_query, top_k=top_k)
        results = [
            RAGSearchResult(
                ticker=h.get("ticker", ticker or "general"),
                text=h["text"],
                source=h["source"],
                relevance_score=h["relevance_score"],
            )
            for h in hits
        ]
        return RAGSearchResponse(query=full_query, results=results)
    except Exception as exc:
        logger.error(f"[Router/rag] search error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {exc}")


@router.get("/stats")
async def rag_stats():
    """Return basic stats about the knowledge base."""
    try:
        stats = rag_engine.get_stats()
        return stats
    except Exception as exc:
        logger.warning(f"[Router/rag] stats error: {exc}")
        return {"error": str(exc), "total_chunks": 0}
