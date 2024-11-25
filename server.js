const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Armazena os produtos em memória
const produtos = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Configuração de sessão
app.use(session({
  secret: 'segredo-unico',
  resave: false,
  saveUninitialized: true
}));

// Página de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// Processa login
app.post('/login', (req, res) => {
  const { username } = req.body;

  if (username) {
    req.session.username = username;
    const ultimoAcesso = new Date().toISOString();
    res.cookie('ultimoAcesso', ultimoAcesso);
    res.redirect('/');
  } else {
    res.status(400).send('Por favor, informe um nome de usuário.');
  }
});

// Verifica se o usuário está logado
app.get('/verificar-sessao', (req, res) => {
  if (req.session.username) {
    res.json({ logado: true, ultimoAcesso: req.cookies.ultimoAcesso });
  } else {
    res.json({ logado: false });
  }
});

// Cadastra um produto
app.post('/cadastrar-produto', (req, res) => {
  if (!req.session.username) {
    return res.status(401).send('Você precisa estar logado para cadastrar um produto.');
  }

  const { codigoBarras, descricao, precoCusto, precoVenda, validade, estoque, fabricante } = req.body;
  const produto = { codigoBarras, descricao, precoCusto, precoVenda, validade, estoque, fabricante };
  produtos.push(produto);
  res.redirect('/');
});

// Exibe os produtos cadastrados
app.get('/produtos', (req, res) => {
  if (!req.session.username) {
    return res.status(401).send('Você precisa estar logado para acessar esta página.');
  }
  res.json(produtos);
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.clearCookie('ultimoAcesso');
    res.redirect('/');
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
