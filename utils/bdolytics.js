const fs = require('fs-extra')
const axios = require('axios')

// https://apiv2.bdolytics.com/ru/RU/market/central-market-data

async function run() {
  let res = await axios.get('https://apiv2.bdolytics.com/ru/RU/market/central-market-data')
  let json = res.data

  let edited = json.data
    .filter(
      (e) =>
        e.grade_type > 2 &&
        ((e.market_main_category == 1 && e.enhancement_level == 20) ||
          (e.market_main_category == 5 && e.enhancement_level == 20) ||
          (e.market_main_category == 10 && e.enhancement_level == 20) ||
          e.name.toLowerCase().includes('глаза роде') ||
          (e.name.toLowerCase().includes('черной звезды') && e.enhancement_level > 18) ||
          (e.market_main_category == 15 &&
            e.market_sub_category !== 5 &&
            e.market_sub_category !== 6 &&
            e.enhancement_level == 20) ||
          (e.market_main_category == 15 && e.name.toLowerCase().includes('лабрескас')) ||
          (e.market_main_category == 15 && e.name.toLowerCase().includes('мертвого бога')) ||
          (e.market_main_category == 15 && e.name.toLowerCase().includes('перчатки тана')) ||
          (e.market_main_category == 15 && e.name.toLowerCase().includes('атора')) ||
          (e.market_main_category == 20 && e.enhancement_level >= 4))
    )
    .map((e) => ({
      id: e.item_id,
      enhancement_level: e.enhancement_level,
      market_main_category: e.market_main_category,
      market_sub_category: e.market_sub_category,
      name: e.name,
      icon: e.icon_image.toLowerCase() + '.webp',
      grade: e.grade_type
    }))

  edited.sort((a, b) => {
    if (a.market_main_category === b.market_main_category) {
      if (a.market_sub_category === b.market_sub_category) {
        if (a.id === b.id) {
          return a.enhancement_level - b.enhancement_level
        }
        return a.id - b.id
      }
      return a.market_sub_category - b.market_sub_category
    }
    return a.market_main_category - b.market_main_category
  })
  fs.writeFileSync(__dirname + '/../public/all.json', JSON.stringify(edited))
}

run()
