'strict mode'

const Koa = require('koa')
const serve = require('koa-static')
const mustache = require('mustache')
const fs = require('fs-extra')
const path = require('path')
const R = require('ramda')
const app = new Koa()
const PRODUCTION_ENVIRONMENT = false

const public = path.join(__dirname, 'public')
const views = path.join(__dirname, 'views')

app.use(async (ctx, next) => {
  try {
    await next()
    if (ctx.status === 404) {
      ctx.body = "404 Page not found"
    }
  } catch (err) {
    ctx.status = 400
    ctx.body = PRODUCTION_ENVIRONMENT
      ? `Error Status 400 (Server error)\n\n Please contact the developer as this should not happen.`
      : `Uh-oh: ${err.message}`
    console.error(err)
  }
})

app.use(serve(public, {defer: true}))

const getPartials = () => {
  const partialsPath = path.join(__dirname, 'partials')
  const fileList = fs.readdirSync(path.join(partialsPath))
  const partials = {}
  fileList.forEach(filename => {
    const file = filename.split('.')[0]
    partials[file] = fs.readFileSync(path.join(partialsPath, filename), 'utf8').trim()
  })
  return partials
}

const getData = (filename) => {
  const fileList = fs.readdirSync(views)
  const dataFileList = fileList.filter(el =>
    (el.endsWith('.data.js') || el.endsWith('.json'))
    && el.split('.')[0] === filename.split('.')[0])
  if (dataFileList.length > 0) {
    const requireList = dataFileList.map(el =>
      require(path.join(views, el)))
    const requireObj = requireList.reduce(R.merge)
    return requireObj
  }
}

app.use(async (ctx, next) => {
  if (ctx.method === 'GET') {
    if (ctx.path.endsWith('.html') || ctx.path === '/') {
      const filename = ctx.path === '/' ? 'index.html' : ctx.path
      const publicPath = path.join(__dirname, 'public', filename) // without extension
      const fileInPublic = fs.pathExistsSync(publicPath)
      console.log(publicPath + '.html')
      if (fileInPublic) {
        const template = fs.readFileSync(path.join(publicPath), 'utf8')
        const partials = getPartials()
        const data = getData(filename)
        const content = mustache.render(template, data, partials)
        ctx.status = 200
        ctx.body = content
      } else {
        ctx.content = '404 Page not found'
      }
    } else {
      next()
    }
  }
})

app.on('error', console.error)

app.listen(1337)
