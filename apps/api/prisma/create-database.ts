import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const url = new URL(databaseUrl);
const databaseName = url.pathname.replace(/^\//, '');

if (!databaseName) {
  throw new Error('DATABASE_URL must include a database name');
}

function escapeIdentifier(value: string) {
  return value.replace(/`/g, '``');
}

async function main() {
  const mariadb = await import('mariadb');
  const connection = await mariadb.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${escapeIdentifier(databaseName)}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
