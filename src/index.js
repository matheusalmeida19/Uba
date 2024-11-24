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

// Rota de perfil protegida
app.get('/perfil', authenticateToken, (req, res) => {
  // A middleware adiciona os dados do usuário em req.user
  res.status(200).send(`
    <h2>Bem-vindo ao seu perfil, ${req.user.username}!</h2>
    <p>Email: ${req.user.email}</p>
  `);
});

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

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // false para STARTTLS
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
    to: process.env.EMAIL_USER, // Receber no mesmo e-mail
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

// Adicionando uma rota para redirecionar após o login com o token
app.post('/login', loginUser, (req, res) => {
  const { token } = res.locals; // Recebe o token do middleware
  res.cookie('token', token, { httpOnly: true }); // Configura o cookie com o token
  res.redirect('/perfil'); // Redireciona o usuário para a página de perfil
});

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

// Rota de teste de envio de e-mail
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

// Rota protegida para obter informações do perfil
app.get('/api/perfil', authenticateToken, async (req, res) => {
  try {
    // Obtém informações do usuário a partir do token
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { reservas: true }, // Inclui reservas (relacione no banco, se ainda não estiver)
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      username: user.username,
      email: user.email,
      photo: user.photo, // Caso adicione fotos no futuro
      reservas: user.reservas || [], // Lista de reservas do usuário
    });
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    res.status(500).json({ error: 'Erro ao carregar perfil' });
  }
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor Iniciado com Sucesso na porta ${port}`);
});
