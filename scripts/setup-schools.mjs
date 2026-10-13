import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  console.log('Creating schools table...');
  await sql`
    CREATE TABLE IF NOT EXISTS schools (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      type text NOT NULL DEFAULT 'SK',
      code text,
      state text DEFAULT 'W.P. Kuala Lumpur',
      aliases jsonb DEFAULT '[]'::jsonb NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    );
  `;

  console.log('Inserting initial 3 schools...');
  const initialSchools = [
    {
      name: 'SK Kuala Lumpur',
      type: 'SK',
      code: 'WBA0001',
      state: 'W.P. Kuala Lumpur',
      aliases: JSON.stringify([
        'SK Kuala Lumpur',
        'Sekolah Kebangsaan Kuala Lumpur',
        'SK KL',
        'Sekolah Kebangsaan KL',
        'SK Kualau Lumpur',
        'Sekolah Rendah Kuala Lumpur',
      ]),
    },
    {
      name: 'SMK Kuala Lumpur',
      type: 'SMK',
      code: 'WEA0001',
      state: 'W.P. Kuala Lumpur',
      aliases: JSON.stringify([
        'SMK Kuala Lumpur',
        'Sekolah Menengah Kebangsaan Kuala Lumpur',
        'SMK KL',
        'Sekolah Menengah Kebangsaan KL',
        'SMK Kualau Lumpur',
        'Sekolah Menengah Kuala Lumpur',
      ]),
    },
    {
      name: 'SMA Kuala Lumpur',
      type: 'SMA',
      code: 'WFA0001',
      state: 'W.P. Kuala Lumpur',
      aliases: JSON.stringify([
        'SMA Kuala Lumpur',
        'Sekolah Menengah Agama Kuala Lumpur',
        'SMA KL',
        'SM Agama Kuala Lumpur',
        'SMA Kualau Lumpur',
        'Sekolah Menengah Agama KL',
        'Sekolah Agama Kuala Lumpur',
      ]),
    },
  ];

  for (const s of initialSchools) {
    const existing = await sql`SELECT id FROM schools WHERE name = ${s.name}`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO schools (name, type, code, state, aliases)
        VALUES (${s.name}, ${s.type}, ${s.code}, ${s.state}, ${s.aliases}::jsonb)
      `;
      console.log(`Inserted school: ${s.name}`);
    } else {
      await sql`
        UPDATE schools 
        SET aliases = ${s.aliases}::jsonb, type = ${s.type}, code = ${s.code}, state = ${s.state}
        WHERE id = ${existing[0].id}
      `;
      console.log(`Updated school: ${s.name}`);
    }
  }

  const all = await sql`SELECT id, name, type, aliases FROM schools`;
  console.log('Current schools in DB:', all);
  await sql.end();
}

run().catch((err) => {
  console.error('Error setting up schools:', err);
  process.exit(1);
});
