
const express = require('express');
const db = require('./db');

const app = express();
app.disable('x-powered-by');

app.use(express.json());
app.use(express.static('public'));

app.get('/users/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: 'id invalide' });
  }

  const result = await db.query(
    'SELECT id, nom FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ erreur: 'introuvable' });
  }

  res.json(result.rows[0]);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'a@test.fr' && password === 'secret') {
    return res.sendStatus(200);
  }

  res.sendStatus(401);
});

module.exports = app;
