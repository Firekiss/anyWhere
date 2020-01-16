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

module.exports = async function (req, res, filePath) {
  try {
    const contentType = mime(filePath)
    const stats = await stat(filePath)
    if (stats.isFile()) {
      res.statusCode = 200
      res.setHeader('Content-Type', contentType)
      fs.createReadStream(filePath).pipe(res)
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
      console.log('data ', data)
      res.end(template(data))
    }
  } catch (ex) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end(`${filePath} is not a directory or file!`)
  }
}
