import dotenv from 'dotenv'; // Carregar variáveis de ambiente do arquivo .env
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer'; // Para envio de e-mails
import cookieParser from 'cookie-parser';
import { registerUser, loginUser } from './controllers/userController.js';
import { prisma } from './prisma.js';
import { authenticateToken } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware para parse de cookies e body
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir arquivos estáticos
app.use(express.static(path.join(path.resolve(), 'src/pages')));
app.use('/image', express.static(path.join(path.resolve(), 'src/image')));

// Rota principal (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'src/pages/index.html'));
});

// Rota protegida para o perfil do usuário
app.get('/perfil', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { reservas: true },
    });

    if (!user) {
      return res.status(404).send('<h2>Usuário não encontrado</h2>');
    }

    res.status(200).send(`
      <h2>Bem-vindo ao seu perfil, ${user.username}!</h2>
      <p>Email: ${user.email}</p>
      <p>Reservas realizadas: ${user.reservas.length}</p>
      <a href="/">Voltar à página inicial</a>
    `);
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    res.status(500).send('<h2>Erro ao carregar o perfil</h2>');
  }
});

// Rota para registro de usuário
app.post('/register', registerUser);

// Rota para login do usuário
app.post('/login', async (req, res) => {
  try {
    const { token, username } = await loginUser(req); // Chama a função de login para autenticação
    res.cookie('token', token, { httpOnly: true }); // Salva o token em um cookie HTTP-only
    res.redirect(`/loginSucesso.html?username=${username}`); // Redireciona para a página de sucesso com o username
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(401).send('<h2>Erro ao fazer login. Verifique suas credenciais.</h2>');
  }
});

// Rota de sucesso de login
app.get('/loginSucesso.html', (req, res) => {
  res.sendFile('/pages/loginSucesso.html', { root: '.' }, (err) => {
      if (err) {
          console.error(`Erro ao carregar loginSucesso.html: ${err.message}`);
          res.status(404).send('<h2>Arquivo não encontrado: loginSucesso.html</h2>');
      }
  });
});


// Rota para envio de e-mails
app.post('/send-email', async (req, res) => {
  const { nome, email, mensagem } = req.body;

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

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `Nova mensagem de contato: ${nome}`,
    text: `Nome: ${nome}\nEmail: ${email}\nMensagem: ${mensagem}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      res.status(500).send('<h2>Erro ao enviar mensagem. Tente novamente mais tarde.</h2>');
    } else {
      console.log('E-mail enviado:', info.response);
      res.redirect('/solicitacao.html');
    }
  });
});

// Rota protegida para criar solicitações
app.post('/solicitar', authenticateToken, async (req, res) => {
  const { local, destino } = req.body;

  try {
    await prisma.solicitacao.create({
      data: {
        local,
        destino,
        userId: req.user.id, // Relaciona a solicitação ao usuário logado
      },
    });
    res.status(201).send('<h2>Solicitação registrada com sucesso!</h2>');
  } catch (error) {
    console.error('Erro ao salvar solicitação:', error);
    res.status(500).send('<h2>Erro ao salvar solicitação.</h2>');
  }
});

// Rota de teste para cookies
app.get('/test-cookie', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('<h2>Token não encontrado</h2>');
  }

  res.status(200).send('<h2>Cookie encontrado!</h2>');
});

// Rota de teste de envio de e-mails
app.get('/test-email', (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Teste de envio de e-mail',
    text: 'Se você recebeu esta mensagem, o envio de e-mail está funcionando!',
  };

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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail de teste:', error);
      res.status(500).send('<h2>Erro ao enviar e-mail de teste.</h2>');
    } else {
      console.log('E-mail de teste enviado com sucesso:', info.response);
      res.send('<h2>E-mail de teste enviado com sucesso!</h2>');
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado com sucesso na porta ${port}`);
});
