// Быстрый генератор ссылки настроек для локального теста фронта.
// Запуск из корня:  pnpm mint-link [discordId]
import { createLink } from '../src/db/index.js';

const id = process.argv[2] ?? 'test-user';
const { token, url, expiredAt } = createLink(id);

console.log('discordId :', id);
console.log('token     :', token);
console.log('prod url  :', url);
console.log('dev url   : http://localhost:5173/user/' + token);
console.log('expires   :', new Date(expiredAt).toLocaleString('ru-RU'));
