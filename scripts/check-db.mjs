import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function check() {
  try {
    await sql`UPDATE children SET email = 'student@exploria.my' WHERE id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'`;
    console.log('Updated Adam with student@exploria.my');
    await sql.end();
  } catch (err) {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  }
}

check();
