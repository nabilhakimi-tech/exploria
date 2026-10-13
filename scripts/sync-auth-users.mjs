import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function syncAuthUsers() {
  const users = [
    { id: '11111111-1111-1111-1111-111111111111', email: 'ahmad@example.com', password: 'Password123!', name: 'Ahmad bin Razak' },
    { id: '22222222-2222-2222-2222-222222222222', email: 'siti@example.com', password: 'Password123!', name: 'Siti Nurhaliza binti Osman' },
    { id: '33333333-3333-3333-3333-333333333333', email: 'tan@example.com', password: 'Password123!', name: 'Tan Ah Kao' },
    { id: '44444444-4444-4444-4444-444444444444', email: 'muthu@example.com', password: 'Password123!', name: 'Muthusamy a/l Ramasamy' },
    { id: '55555555-5555-5555-5555-555555555555', email: 'staff@exploria.my', password: 'Password123!', name: 'Aina binti Zulkifli (Staf Exploria)' },
    { id: '66666666-6666-6666-6666-666666666666', email: 'admin@exploria.my', password: 'Password123!', name: 'Pentadbir Utama Exploria' },
  ];

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      id: u.id,
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.name },
    });
    if (error) {
      console.log(`User ${u.email}:`, error.message);
    } else {
      console.log(`Created user ${u.email} with id ${data.user.id}`);
    }
  }
}

syncAuthUsers();
