const express = require('express')
const { checkLink, updateItems, toggleQueue, toggleCoupons } = require(__dirname + '/db.js')
const { service } = require(__dirname + '/../app.config.js')
const bodyParser = require('body-parser')
const path = require('path')
const { URL } = require('url')
const app = express()
const router = express.Router()

app.use(bodyParser.json())

app.set('view engine', 'ejs')
app.set('views', __dirname + '/../views')

router.use(express.static(path.join(__dirname, '..', 'dist')))

router.get('/', async (req, res) => {
  res.render('index')
})

router.get('/:token', async (req, res) => {
  const token = req.params.token
  const data = await checkLink(token)
  if (data) {
    res.render('index', data)
  } else res.render('index')
})

router.post('/:token/items/edit', async (req, res) => {
  const token = req.params.token
  const body = req.body

  const isArray = (array) => array instanceof Array
  const isObjectArray = (array) => array.every((i) => typeof i === 'object')
  const isCurrectObject = (array) =>
    array.every(
      (i) =>
        Object.hasOwn(i, 'lvl') &&
        Object.hasOwn(i, 'id') &&
        typeof i.lvl === 'number' &&
        typeof i.id === 'number'
    )

  if (!isArray(body) || !isObjectArray(body) || !isCurrectObject(body)) {
    return res.json({ errors: ['Items must be instance of Array<Object{id, lvl}>!'] })
  }

  if (await updateItems(token, body)) return res.json({ result: true })
  return res.status(401).json({ errors: ['The token does not exist or has expired!'] })
})

router.get('/:token/queue/toggle', async (req, res) => {
  const token = req.params.token

  if (await toggleQueue(token)) return res.json({ result: true })
  return res.status(401).json({ errors: ['The token does not exist or has expired!'] })
})

router.get('/:token/coupons/toggle', async (req, res) => {
  const token = req.params.token

  if (await toggleCoupons(token)) return res.json({ result: true })
  return res.status(401).json({ errors: ['The token does not exist or has expired!'] })
})

const pathname = new URL(service.host).pathname
app.use(pathname, router)
app.listen(service.port, () => {
  console.log(`Web-app listening on port ${service.port}`)
})
