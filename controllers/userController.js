// controllers/userController.js
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);

  try {
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('<h2>Este e-mail já está registrado!</h2>');
    }

    if (!username) {
        return res.status(400).send('<h2>Nome de usuário é obrigatório!</h2>');
      }

    if (!password) {
        return res.status(400).send('<h2>Senha não pode ser vazia!</h2>');
      }
  

    const hashedPassword = await bcrypt.hash(password, 10);

    // Criação do novo usuário
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Enviar uma mensagem de sucesso
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
