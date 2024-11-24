import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js'; // Importando o Prisma Client
import jwt from 'jsonwebtoken';

// Função de registro do usuário
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).send('<h2>Este e-mail já está registrado!</h2>');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).send(`
      <h2>Cadastro realizado com sucesso!</h2>
      <p>Você pode fazer login agora.</p>
      <a href="login.html">Clique aqui para fazer login</a>
    `);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).send('<h2>Erro ao registrar o usuário. Tente novamente.</h2>');
  }
};

// Função de login do usuário
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).send('<h2>Usuário não encontrado!</h2>');
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send('<h2>Senha incorreta!</h2>');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Configura o token em um cookie e redireciona para a página inicial
    res.cookie('token', token, { httpOnly: true });
    res.redirect(`/loginSucesso.html?username=${user.username}`);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).send('<h2>Erro ao fazer login. Tente novamente.</h2>');
  }
};
