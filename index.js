const express = require('express');
const path = require('path');
const db = require('./config/database');  
const User = require('./models/user.js');
const userController = require('./controllers/userController');
const bodyParser = require('body-parser');   

const app = express();
const port = process.env.PORT || 8000;

// Middleware para processar o corpo das requisições
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '.')));
app.use(express.urlencoded({ extended: true }));

db.sync()
  .then(() => console.log('Banco de dados sincronizado com sucesso!'))
  .catch((error) => console.error('Erro ao sincronizar o banco de dados:', error));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/register', userController.registerUser);

app.post('/solicitar', async (req, res) => {
  const { local, destino } = req.body;
  console.log(`Local: ${local}, Destino: ${destino}`);

  try {
    
    await User.create({ local, destino });
    res.send(`<h2>Solicitação Recebida e salva! Obrigado.</h2>`);
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    res.status(500).send('<h2>Erro ao processar a solicitação.</h2>');
  }
});

app.listen(port, () => {
  console.log('Servidor Iniciado com Sucesso');
});
