import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function checkAuthUsers() {
  try {
    const users = await sql`SELECT id, email, email_confirmed_at FROM auth.users ORDER BY created_at DESC;`;
    console.log('Current users:', users);
  } catch (err) {
    console.log('Error checking auth.users:', err.message);
  } finally {
    await sql.end();
  }
}

checkAuthUsers();
