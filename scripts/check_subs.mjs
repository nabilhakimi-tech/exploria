import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function check() {
  const subs = await sql`SELECT id, title, category, created_at FROM subjects ORDER BY created_at DESC`;
  console.log('--- SUBJECTS ---');
  console.log(subs);

  const qs = await sql`SELECT q.id, q.title, q.subject_id, s.title as subject_title FROM quizzes_tournaments q LEFT JOIN subjects s ON q.subject_id = s.id`;
  console.log('--- QUIZZES ---');
  console.log(qs);

  await sql.end();
}

check();
