const {maxAge, expires, cacheControl, lastModified, etag} = require('../config/defaultConf').cache

const refreshResCache = (stats, res) => {
  // 如果配置支持缓存结束时间
  if (expires) {
    res.setHeader('Expires', new Date(Date.now() + maxAge * 1000))
  }

  // 配置支持时间段缓存
  if (cacheControl) {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`)
  }

  if (lastModified) {
    res.setHeader('Last-Modified', new Date(stats.mtime))
  }

  if (etag) {
    res.setHeader('ETag', `${stats.size}-${stats.mtime}`)
  }
}

module.exports = function isRefresh(stats, req, res) {
  refreshResCache(stats, res)

  // 获取浏览器带过来的 最后更新时间和etag
  console.log('headers', req.headers)
  const lastModified = req.headers['if-modified-since']
  const etag = req.headers['if-none-match']

  if (!lastModified && !etag) {
    return true
  }

  if (lastModified && lastModified !== res.getHeader('Last-Modified')) {
    return true
  }

  if (etag && etag !== res.getHeader('ETag')) {
    return true
  }

  return false
}