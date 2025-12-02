require('dotenv').config();
const { BitlyClient } = require('bitly');

class LinkShortener {
  constructor() {
    this.bitly = new BitlyClient(process.env.BITLY_ACCESS_TOKEN);
    this.cache = new Map(); // Cache shortened links
  }
  
  async shorten(longUrl) {
    try {
      // Check cache first
      if (this.cache.has(longUrl)) {
        console.log('✅ Using cached short link');
        return this.cache.get(longUrl);
      }
      
      console.log('🔗 Shortening URL:', longUrl);
      
      // Shorten with Bitly
      const result = await this.bitly.shorten(longUrl);
      const shortUrl = result.link;
      
      // Cache it
      this.cache.set(longUrl, shortUrl);
      
      console.log('✅ Shortened to:', shortUrl);
      return shortUrl;
      
    } catch (error) {
      console.error('❌ Error shortening link:', error.message);
      // Return original URL if shortening fails
      return longUrl;
    }
  }
  
  async shortenMultiple(urls) {
    const promises = urls.map(url => this.shorten(url));
    return await Promise.all(promises);
  }
}

module.exports = LinkShortener;