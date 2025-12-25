import feedparser
import random

class NewsAggregator:
    FEEDS = [
        "https://techcrunch.com/feed/",
        "https://www.theverge.com/rss/index.xml",
        "https://www.wired.com/feed/rss"
    ]

    def get_trending(self, limit=10):
        all_entries = []
        for url in self.FEEDS:
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries[:5]: # Get top 5 from each
                    # Extract image if available
                    image = None
                    if 'media_content' in entry:
                        image = entry.media_content[0]['url']
                    elif 'links' in entry:
                         for link in entry.links:
                             if link.type.startswith('image/'):
                                 image = link.href
                                 break
                    
                    all_entries.append({
                        "title": entry.title,
                        "url": entry.link,
                        "source": feed.feed.title if 'title' in feed.feed else "Unknown Source",
                        "summary": entry.summary[:200] + "..." if 'summary' in entry else "",
                        "published": entry.published if 'published' in entry else "",
                        "image": image
                    })
            except Exception as e:
                print(f"Error parsing feed {url}: {e}")
        
        # Shuffle to mix sources
        random.shuffle(all_entries)
        return all_entries[:limit]
