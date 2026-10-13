import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function inspect() {
  const tables = [
    'profiles',
    'children',
    'subjects',
    'lessons_materials',
    'quizzes_tournaments',
    'questions',
    'quiz_attempts',
    'rewards_certificates'
  ];

  for (const t of tables) {
    const rows = await sql`SELECT count(*) FROM ${sql(t)}`;
    console.log(`Table ${t}: ${rows[0].count} rows`);
  }

  // Also check column schema for each table
  for (const t of tables) {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${t}
    `;
    console.log(`Columns for ${t}:`, cols.map(c => `${c.column_name} (${c.data_type})`));
  }

  await sql.end();
}

inspect();
