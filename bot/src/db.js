const config = require("./config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.server
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./models/user.model.js")(sequelize, Sequelize);
db.links = require("./models/link.model.js")(sequelize, Sequelize);

db.users.hasOne(db.links, { as: "links", foreignKey: "user_id" });
db.links.belongsTo(db.users, { as: "users", foreignKey: "user_id" });

module.exports = db;
