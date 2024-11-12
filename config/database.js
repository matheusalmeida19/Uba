// config/database.js
const { Sequelize } = require('sequelize');

// Usar variáveis de ambiente para conexão com o banco
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {  
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT || 3306,
});

module.exports = db;
