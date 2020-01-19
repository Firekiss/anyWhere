const {promisify} = require('util')
const fs = require('fs')
const path = require('path')
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const handlebars = require('handlebars')
const conf = require('../config/defaultConf')
const tplPath = path.join(__dirname, '../template/dir.html')
const source = fs.readFileSync(tplPath, { encoding: 'utf8' })
const template = handlebars.compile(source)
const mime = require('../help/mime')
const compress = require('../help/compress')
const range = require('./range')
const isRefresh = require('./cache')

module.exports = async function (req, res, filePath) {
  try {
    const stats = await stat(filePath)
    if (stats.isFile()) {
      // 协商缓存判断
      if (isRefresh(stats, req, res)) {
        res.statusCode = 304
        res.end()
        return
      }

      res.setHeader('Content-Type', mime(filePath))
      res.statusCode = 200
      let rs
      const {code, start, end} = range(stats.size, req, res)
      if (code === 200) {
        rs = fs.createReadStream(filePath)
      } else {
        rs = fs.createReadStream(filePath, {start, end})
      }
      if (filePath.match(conf.compress)) {
        rs = compress(rs, req, res)
      }
      rs.pipe(res)
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath)
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')
      const dir = path.relative(conf.root, filePath)
      const data = {
        title: path.basename(filePath),
        dir: dir ? `/${dir}` : '',
        files
      }
      res.end(template(data))
    }
  } catch (ex) {
    console.log('ex >>>>>', ex)
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end(`${filePath} is not a directory or file!`)
  }
}
