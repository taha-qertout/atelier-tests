
const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

beforeEach(async () => {
  await db.query('DROP TABLE IF EXISTS users');
  await db.query(
    'CREATE TABLE users (id SERIAL PRIMARY KEY, nom TEXT NOT NULL)'
  );
  await db.query("INSERT INTO users (nom) VALUES ('Alice')");
});

afterAll(async () => {
  await db.end();
});

describe('GET /users/:id', () => {
  test("retourne 200 et l'utilisateur existant", async () => {
    const res = await request(app).get('/users/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, nom: 'Alice' });
  });

  test('retourne 404 pour un utilisateur inconnu', async () => {
    const res = await request(app).get('/users/999');
    expect(res.status).toBe(404);
  });

  test('retourne 400 pour un identifiant invalide', async () => {
    const res = await request(app).get('/users/abc');
    expect(res.status).toBe(400);
  });

  test("résiste à une tentative d'injection SQL", async () => {
    const injection = encodeURIComponent('1; DROP TABLE users;--');
    const res = await request(app).get(`/users/${injection}`);
    expect(res.status).toBe(400);

    const result = await db.query('SELECT COUNT(*) FROM users');
    expect(Number(result.rows[0].count)).toBe(1);
  });

  test('ne divulgue pas la technologie du serveur', async () => {
    const res = await request(app).get('/users/1');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
