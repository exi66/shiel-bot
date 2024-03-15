const fs = require("fs-extra");

async function run(config) {
  let json = require("./market.json");

  let edited = json.items
    .filter(
      (e) =>
        e.grade > 2 &&
        (e.main_category == 1 ||
          e.main_category == 5 ||
          e.main_category == 10 ||
          e.name?.toLowerCase().includes("глаза роде") ||
          e.name?.toLowerCase().includes("черной звезды") ||
          (e.main_category == 15 &&
            e.sub_category !== 5 &&
            e.sub_category !== 6) ||
          (e.main_category == 15 &&
            e.name?.toLowerCase().includes("лабрескас")) ||
          (e.main_category == 15 &&
            e.name?.toLowerCase().includes("мертвого бога")) ||
          (e.main_category == 15 &&
            e.name?.toLowerCase().includes("перчатки тана")) ||
          (e.main_category == 15 && e.name?.toLowerCase().includes("атора")) ||
          e.main_category == 20)
    )
    .map((e) => ({
      id: e.main_key,
      sub_items: e.sub_items,
      market_main_category: e.main_category,
      market_sub_category: e.sub_category,
      name: e.name,
      icon: e.img.toLowerCase(),
      grade: e.grade,
    }));
  let final = [];
  for (let e of edited) {
    let r = e.sub_items.filter(
      (b) =>
        (e.market_main_category == 1 && b.sub_key == 20) ||
        (e.market_main_category == 5 && b.sub_key == 20) ||
        (e.market_main_category == 10 && b.sub_key == 20) ||
        e.name?.toLowerCase().includes("глаза роде") ||
        (e.name?.toLowerCase().includes("черной звезды") && b.sub_key > 18) ||
        (e.market_main_category == 15 && b.sub_key == 20) ||
        (e.market_main_category == 15 &&
          e.name?.toLowerCase().includes("лабрескас")) ||
        (e.market_main_category == 15 &&
          e.name?.toLowerCase().includes("мертвого бога")) ||
        (e.market_main_category == 15 &&
          e.name?.toLowerCase().includes("перчатки тана")) ||
        (e.market_main_category == 15 &&
          e.name?.toLowerCase().includes("атора")) ||
        (e.market_main_category == 20 && b.sub_key >= 4)
    );
    for (let _r of r) {
      final.push({
        id: e.id,
        enhancement_level: _r.sub_key,
        market_main_category: e.market_main_category,
        market_sub_category: e.market_sub_category,
        name: e.name,
        icon: e.icon.toLowerCase(),
        grade: e.grade,
      });
    }
  }

  final.sort((a, b) => {
    if (a.market_main_category === b.market_main_category) {
      if (a.market_sub_category === b.market_sub_category) {
        if (a.id === b.id) {
          return a.enhancement_level - b.enhancement_level;
        }
        return a.id - b.id;
      }
      return a.market_sub_category - b.market_sub_category;
    }
    return a.market_main_category - b.market_main_category;
  });

  fs.writeFileSync("./result/garmoth.json", JSON.stringify(final));
}

run();
