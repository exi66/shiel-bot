const fs = require("fs-extra");

async function run(config) {
  let json = require("./central-market-data.json");

  let edited = json.data
    .filter(
      (e) =>
        e.grade_type > 2 &&
        ((e.market_main_category == 1 && e.enhancement_level == 20) ||
          (e.market_main_category == 5 && e.enhancement_level == 20) ||
          (e.market_main_category == 10 && e.enhancement_level == 20) ||
          (e.enhancement_level == 5 &&
            e.name.toLowerCase().includes("глаза роде")) ||
          (e.market_main_category == 15 &&
            e.market_sub_category !== 5 &&
            e.market_sub_category !== 6 &&
            e.enhancement_level == 20) ||
          (e.market_main_category == 15 &&
            e.name.toLowerCase().includes("лабрескас")) ||
          (e.market_main_category == 15 &&
            e.name.toLowerCase().includes("мертвого бога")) ||
          (e.market_main_category == 15 &&
            e.name.toLowerCase().includes("перчатки тана")) ||
          (e.market_main_category == 15 &&
            e.name.toLowerCase().includes("атора")) ||
          (e.market_main_category == 20 && e.enhancement_level >= 4))
    )
    .map((e) => ({
      id: e.item_id,
      enhancement_level: e.enhancement_level,
      market_main_category: e.market_main_category,
      market_sub_category: e.market_sub_category,
      name: e.name,
    }));

  fs.writeFileSync("./edited.json", JSON.stringify(edited));
}

run();
