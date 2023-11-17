module.exports = (sequelize, Sequelize) => {
  const Link = sequelize.define(
    "links",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
      },
      link: {
        unique: true,
        type: Sequelize.STRING,
      },
      expired_at: {
        type: Sequelize.DATE,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Link;
};
