const sequelize = require('./database');

// Registra todos los modelos para que sync() conozca las tablas
require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync();
    console.log('Models synchronized');
    process.exit(0);
  } catch (error) {
    console.error('Sync error:', error);
    process.exit(1);
  }
})();