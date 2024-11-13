import dotenv from 'dotenv'; // Carregar as variáveis de ambiente do arquivo .env
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { registerUser, loginUser } from './controllers/userController.js';
import { prisma } from './prisma.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware para processar o corpo das requisições
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Definir o diretório estático para os arquivos HTML e imagens
app.use(express.static(path.join(path.resolve(), 'src/pages')));
app.use('/image', express.static(path.join(path.resolve(), 'src/image')));

// Rota principal para servir o arquivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'src/pages/index.html'));
});

// Rota para registro de usuário
app.post('/register', registerUser);

// Rota para login de usuário
app.post('/login', loginUser);

// Rota para criação de solicitação
app.post('/solicitar', async (req, res) => {
  const { local, destino } = req.body;

  try {
    await prisma.solicitacao.create({ data: { local, destino } });
    res.send('<h2>Solicitação Recebida e salva! Obrigado.</h2>');
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    res.status(500).send('<h2>Erro ao processar a solicitação.</h2>');
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log('Servidor Iniciado com Sucesso');
});
