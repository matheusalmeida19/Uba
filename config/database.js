// config/database.js
const { Sequelize } = require('sequelize');

// Usar variáveis de ambiente para conexão com o banco
const db = new Sequelize('uba', 'root', '22311803', {  
    host: '201.75.83.47',
    dialect: 'mysql',
    port: 3306,
  });
  
module.exports = db;
