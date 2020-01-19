module.exports = function (totalSize, req, res) {
  // 获取浏览器发送过来的请求范围
  const range = req.headers['range']

  if (!range) {
    return {
      code: 200
    }
  }

  const sizes = range.match(/bytes=(\d*)-(\d*)/)
  const end = sizes[2] || totalSize
  const start = sizes[1] || 0

  // 处理起止位置值得异常情况
  if (start > end || start < 0 || end > totalSize) {
    return {
      code: 200
    }
  }

  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`)
  res.setHeader('Content-Length', end - start)
  return {
    code: 206,
    start: parseInt(start),
    end: parseInt(end)
  }
}