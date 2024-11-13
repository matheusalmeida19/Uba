// controllers/userController.js
import bcrypt from 'bcryptjs';
import { prisma }from '../prisma.js'; // Importando o Prisma Client

// Função de registro do usuário
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).send('<h2>Este e-mail já está registrado!</h2>');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
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
