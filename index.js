import dotenv from 'dotenv'; // Carregar as variáveis de ambiente do arquivo .env
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { registerUser } from './src/controllers/userController.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(path.resolve(), '.')));
app.use(express.urlencoded({ extended: true }));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'index.html'));
});

// Rotas para registro e solicitação
app.post('/register', registerUser);

app.post('/solicitar', async (req, res) => {
  const { local, destino } = req.body;

  try {
    await prisma.solicitacao.create({ data: { local, destino } });
    res.send(`<h2>Solicitação Recebida e salva! Obrigado.</h2>`);
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    res.status(500).send('<h2>Erro ao processar a solicitação.</h2>');
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log('Servidor Iniciado com Sucesso');
});
