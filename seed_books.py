import os
import sys

# Add current dir to pythonpath
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.engines.rag_engine import rag_engine
from app.core.logging_config import logger

books_content = {
    "Trading in the Zone by Mark Douglas.txt": """
Trading in the Zone focuses on the psychological aspects of trading. 
Key concepts include:
1. The market is fundamentally a probabilisitic environment. There is no certainty.
2. A successful trader must accept the risk on every single trade without emotional attachment.
3. You must trade without fear and without being reckless.
4. The "Zone" is a state of mind where you act on market signals without hesitation or internal conflict.
5. Consistency is achieved by having a statistical edge and executing flawlessly, knowing that individual outcomes are random, but collective outcomes over a large sample size are predictable.
    """,
    "Best Loser Wins by Tom Hougaard.txt": """
Best Loser Wins by Tom Hougaard argues that normal human psychology is entirely unsuited for trading.
Key concepts:
1. To win, you must do what is unnatural: add to winning positions and cut losing positions immediately.
2. People naturally want to lock in profits early (fear of losing gains) and hold onto losses hoping they bounce back (hope).
3. The "best loser" is the one who cuts their losses without hesitation. 
4. Stop focusing on the win rate. A high win rate is meaningless if your average loss dwarfs your average win.
5. Embrace the pain of being wrong. Trade with size only when you are in profit.
    """,
    "Technical Analysis of the Financial Markets by John J. Murphy.txt": """
This book is often considered the bible of technical analysis.
Key concepts:
1. Market action discounts everything. All known information is already reflected in the price.
2. Prices move in trends. A trend in motion is more likely to continue than to reverse.
3. History repeats itself, primarily due to human psychology.
4. Key tools include support and resistance levels, trendlines, and moving averages.
5. Volume must confirm the trend. A strong trend is accompanied by rising volume.
6. Oscillators (like RSI and MACD) are used to identify overbought or oversold conditions.
    """,
    "Getting Started in Technical Analysis by Jack D. Schwager.txt": """
Schwager provides a practical guide to technical trading.
Key concepts:
1. Understand the difference between fundamental analysis (what should happen) and technical analysis (what is actually happening).
2. Use chart patterns like Head and Shoulders, Triangles, and Double Tops/Bottoms to identify breakouts or reversals.
3. Always use stop-loss orders to protect capital. The placement of a stop should be based on technical levels, not arbitrary percentages.
4. Risk management is more important than the entry signal itself.
5. Don't trade in low-liquidity environments or highly erratic markets without a clear edge.
    """,
    "Japanese Candlestick Charting Techniques by Steve Nison.txt": """
Steve Nison introduced Japanese candlestick charts to the Western world.
Key concepts:
1. A candlestick shows the open, high, low, and close. The body represents the open-to-close range, while shadows represent extremes.
2. Reversal patterns: Doji (indecision), Hammer (bullish reversal), Shooting Star (bearish reversal), Engulfing Patterns (strong momentum shifts).
3. Candlesticks should not be used in isolation. They must be combined with Western technical indicators (like support/resistance or moving averages).
4. The size of the real body indicates the strength of the buying or selling pressure.
    """,
    "Technical Analysis Using Multiple Timeframes by Brian Shannon.txt": """
Brian Shannon emphasizes the importance of analyzing different time horizons.
Key concepts:
1. The market structure consists of 4 phases: Accumulation, Markup, Distribution, and Markdown.
2. Use multiple timeframes to increase the probability of success. A larger timeframe dictates the overall trend, while a smaller timeframe is used for precise entry and exit.
3. Never trade against the primary trend of the higher timeframe.
4. The Volume Weighted Average Price (VWAP) is a critical institutional tool to measure the true average price.
5. Only buy pullbacks in an established uptrend, never buy a stock in a markdown phase.
    """,
    "Encyclopedia of Chart Patterns by Thomas N. Bulkowski.txt": """
A comprehensive statistical analysis of chart patterns.
Key concepts:
1. Bulkowski statistically ranks patterns based on failure rates and average gains/losses.
2. High-performing patterns include High and Tight Flags, Head and Shoulders Bottoms, and Ascending Triangles.
3. Breakouts often pull back to the breakout level (a "throwback" or "pullback") before resuming the trend. This offers a secondary, often safer, entry point.
4. Volume trends prior to the breakout are critical indicators of the pattern's validity. Decreasing volume during formation and high volume on breakout is ideal.
    """
}

def main():
    os.makedirs("books_vault", exist_ok=True)
    for filename, content in books_content.items():
        filepath = os.path.join("books_vault", filename)
        with open(filepath, "w") as f:
            f.write(content.strip())
        
        logger.info(f"Indexing {filename}...")
        try:
            rag_engine.index_file(filepath, source_name=filename)
            logger.info(f"Successfully indexed {filename}")
        except Exception as e:
            logger.error(f"Failed to index {filename}: {e}")

if __name__ == "__main__":
    main()
