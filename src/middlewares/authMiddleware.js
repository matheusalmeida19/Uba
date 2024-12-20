import jwt from 'jsonwebtoken';

// Middleware para autenticar o token
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('<h2>Token não fornecido!</h2>');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('<h2>Token inválido!</h2>');
    }

    req.user = user; // Adiciona os dados do usuário à requisição
    next();
  });
};
