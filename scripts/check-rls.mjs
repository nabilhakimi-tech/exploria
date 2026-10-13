import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function checkRLS() {
  const rls = await sql`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `;
  console.log('RLS status:', rls);

  const policies = await sql`
    SELECT * FROM pg_policies WHERE schemaname = 'public';
  `;
  console.log('Policies:', policies);
  await sql.end();
}

checkRLS();
