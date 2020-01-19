module.exports = {
  host: '127.0.0.1',
  port: 3009,
  root: process.cwd(),
  compress: /.(html|js|css|md)/,
  cache: {
    maxAge: 600,
    expires: true,
    cacheControl: true,
    lastModified: true,
    etag: true
  }
}