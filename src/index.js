import dotenv from 'dotenv'; // Carregar variáveis de ambiente do arquivo .env
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer'; // Para envio de e-mails
import { registerUser, loginUser } from './controllers/userController.js';
import { prisma } from './prisma.js';
import { authenticateToken } from './middlewares/authMiddleware.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Definir diretórios estáticos para arquivos HTML e imagens
app.use(express.static(path.join(path.resolve(), 'src/pages')));
app.use('/image', express.static(path.join(path.resolve(), 'src/image')));

// Rota principal para servir o arquivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'src/pages/index.html'));
});

// Rota para o perfil do usuário
app.get('/perfil', authenticateToken, (req, res) => {
  res.sendFile(path.join(path.resolve(), 'src/pages/perfil.html'));
});

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verificação da conexão SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('Erro ao conectar ao servidor SMTP:', error);
  } else {
    console.log('Conexão SMTP estabelecida:', success);
  }
});

// Rota para envio de e-mails
app.post('/send-email', async (req, res) => {
  const { nome, email, mensagem } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `Nova mensagem de contato: ${nome}`,
    text: `Nome: ${nome}\nEmail: ${email}\nMensagem: ${mensagem}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      return res.status(500).send('Erro ao enviar mensagem. Tente novamente mais tarde.');
    }
    console.log('E-mail enviado:', info.response);
    res.redirect('/solicitacao.html');
  });
});

// Rota para registro de usuário
app.post('/register', registerUser);

// Rota para login do usuário
app.post('/login', async (req, res) => {
  try {
    const token = await loginUser(req); // Chama a função de login para autenticação
    res.cookie('token', token, { httpOnly: true, secure: true }); // Salva o token no cookie
    res.redirect('/loginSucesso.html'); // Redireciona para a página de sucesso
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(400).send('<h2>Erro ao fazer login. Verifique suas credenciais.</h2>');
  }
});

// Rota para servir a página de sucesso de login
app.get('/loginSucesso.html', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'src/pages/loginSucesso.html'));
});

// Rota protegida para obter informações do perfil do usuário
app.get('/api/perfil', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { reservas: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      username: user.username,
      email: user.email,
      photo: user.photo || '', // Caso fotos sejam adicionadas
      reservas: user.reservas || [],
    });
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    res.status(500).json({ error: 'Erro ao carregar perfil' });
  }
});

// Rota para criação de solicitações de viagem
app.post('/solicitar', async (req, res) => {
  const { local, destino } = req.body;

  try {
    await prisma.solicitacao.create({ data: { local, destino } });
    res.send('<h2>Solicitação recebida e salva! Obrigado.</h2>');
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    res.status(500).send('<h2>Erro ao processar a solicitação.</h2>');
  }
});

// Rota de teste para envio de e-mails
app.get('/test-email', (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Teste de envio de e-mail',
    text: 'Se você recebeu esta mensagem, o envio de e-mail está funcionando!',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail de teste:', error);
      res.status(500).send('Erro ao enviar e-mail de teste.');
    } else {
      console.log('E-mail de teste enviado com sucesso:', info.response);
      res.send('E-mail de teste enviado com sucesso!');
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado com sucesso na porta ${port}`);
});
