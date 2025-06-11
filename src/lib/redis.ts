// Simple in-memory cache for development (no Redis dependency)
class SimpleCache {
  private cache = new Map<string, { data: any; expiry: number }>()

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return JSON.stringify(item.data)
  }

  async set(key: string, value: string, options?: { ex: number }): Promise<void> {
    const expiry = options?.ex ? Date.now() + (options.ex * 1000) : Date.now() + (300 * 1000) // 5 min default
    this.cache.set(key, { data: JSON.parse(value), expiry })
  }
}

// Use simple cache instead of Redis
const redis = new SimpleCache()

export default redis
