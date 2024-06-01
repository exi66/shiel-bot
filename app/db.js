const db = require(__dirname + '/../models/index.js')
const { discord, service } = require(__dirname + '/../app.config.js')

module.exports.db = db

module.exports.createLink = async function (userId) {
  const User = db.User
  const Link = db.Link

  let user = await User.findOne({
    where: {
      discordId: userId
    }
  })

  if (!user) {
    user = await User.create({
      discordId: userId
    })
  } else {
    await Link.destroy({
      where: {
        userId: user.id
      }
    })
  }

  const buf1 = Buffer.from(userId, 'utf8')
  const buf2 = Buffer.from(new Date().toISOString(), 'utf8')
  const buf3 = Buffer.from(discord.token, 'utf8')
  const bufResult = buf1.map(
    (b) =>
      b ^
      buf2[Math.floor(Math.random() * buf2.length)] ^
      buf3[Math.floor(Math.random() * buf3.length)]
  )
  const linkHash = bufResult.toString('hex')
  const expired = new Date(new Date().getTime() + 1000 * 10 * 60)

  const link = await Link.create({
    userId: user.id,
    link: linkHash,
    expiredAt: expired
  })

  setTimeout(async () => {
    await Link.destroy({
      where: {
        id: link.id
      }
    })
  }, 1000 * 10 * 60)

  return {
    link: service.host + 'user/' + linkHash,
    expired: expired
  }
}

module.exports.checkLink = async function (token) {
  const User = db.User
  const Link = db.Link

  let link = await Link.findOne({
    where: {
      link: token
    },
    include: User
  })
  if (!link) return false

  const items = await link.User.getItems()

  return {
    link: {
      expiredAt: link.expiredAt.getTime(),
      token: token
    },
    user: {
      notifyCoupons: link.User.notifyCoupons,
      notifyQueue: link.User.notifyQueue
    },
    items: items.map((e) => ({ id: e.itemId, lvl: e.lvl }))
  }
}

module.exports.updateItems = async function (token, items) {
  const User = db.User
  const Link = db.Link
  const Item = db.Item

  let link = await Link.findOne({
    where: {
      link: token
    },
    include: User
  })
  if (!link) return false

  const __items = await link.User.getItems()
  await __items.forEach((element) => {
    element.destroy()
  })

  for (const item of items) {
    await Item.create({
      userId: link.User.id,
      lvl: parseInt(item.lvl),
      itemId: parseInt(item.id)
    })
  }

  return true
}

module.exports.toggleCoupons = async function (token) {
  const User = db.User
  const Link = db.Link

  let link = await Link.findOne({
    where: {
      link: token
    },
    include: User
  })
  if (!link) return false

  link.User.set({
    notifyCoupons: !link.User.notifyCoupons
  })
  await link.User.save()

  return true
}

module.exports.toggleQueue = async function (token) {
  const User = db.User
  const Link = db.Link

  let link = await Link.findOne({
    where: {
      link: token
    },
    include: User
  })
  if (!link) return false

  link.User.set({
    notifyQueue: !link.User.notifyQueue
  })
  await link.User.save()

  return true
}
