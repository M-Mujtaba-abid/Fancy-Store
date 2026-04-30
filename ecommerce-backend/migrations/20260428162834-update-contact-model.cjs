export const up = async (queryInterface, Sequelize) => {
  await queryInterface.removeConstraint("contacts", "contacts_email_key");
  await queryInterface.addColumn("contacts", "category", {
    type: Sequelize.ENUM("order_issue", "payment", "return_refund", "general", "other"),
    defaultValue: "general",
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn("contacts", "category");
};