require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

const app = express();

// Configuração básica
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // Para processar dados do formulário
app.use('/public', express.static(`${process.cwd()}/public`));

// Banco de dados em memória para armazenar URLs encurtadas
const urlDatabase = [];
let urlId = 1;

// Página inicial
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Endpoint para criar URL encurtada
app.post('/api/shorturl', (req, res) => {
  const { url: originalUrl } = req.body;

  // Verificar se a URL é válida
  const parsedUrl = url.parse(originalUrl);
  if (!parsedUrl.protocol || !parsedUrl.hostname) {
    return res.json({ error: 'invalid url' });
  }

  // Verificar se o hostname existe usando DNS
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Armazenar a URL no "banco de dados"
    const shortUrl = urlId++;
    urlDatabase.push({ originalUrl, shortUrl });

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Endpoint para redirecionar com base na URL encurtada
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;

  // Encontrar a URL original no "banco de dados"
  const entry = urlDatabase.find((item) => item.shortUrl === parseInt(shortUrl, 10));
  if (!entry) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  // Redirecionar para a URL original
  res.redirect(entry.originalUrl);
});

// Iniciar o servidor
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
