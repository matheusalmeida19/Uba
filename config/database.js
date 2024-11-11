// config/database.js
const { Sequelize } = require('sequelize');

const db = new Sequelize('uba', 'root', '22311803', {  
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
});

module.exports = db;
