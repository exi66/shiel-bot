module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "users",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      discord_id: {
        unique: true,
        type: Sequelize.STRING,
      },
      notification_coupones: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      notification_queue: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      items: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return User;
};
