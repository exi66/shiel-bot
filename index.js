const where = __filename.slice(__dirname.length + 1);
const error_here = where + "/error";
const log_here = where + "/log";

(async() => {
  const config = require("./config.json");
  const client = await require("./bot.js")(config);
  const scraper = require("./scraper.js")(client);
})();