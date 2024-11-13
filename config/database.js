const { Sequelize } = require('sequelize');

// Usar as variáveis de ambiente para conexão com o banco
const db = new Sequelize({
  host: process.env.MYSQL_HOST,          // Host do banco de dados
  username: process.env.MYSQL_USER,      // Usuário do banco
  password: process.env.MYSQL_PASSWORD,  // Senha do banco
  database: process.env.MYSQL_DATABASE,  // Nome do banco de dados
  port: process.env.MYSQL_PORT,          // Porta do banco
  dialect: 'mysql',                      // O dialeto de MySQL
});

module.exports = db;

