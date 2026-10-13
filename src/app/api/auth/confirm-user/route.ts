import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import postgres from 'postgres';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email diperlukan' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Direct DB update on auth.users
    try {
      const sql = postgres(process.env.DATABASE_URL!);
      await sql`
        UPDATE auth.users 
        SET email_confirmed_at = now() 
        WHERE LOWER(email) = ${cleanEmail} AND email_confirmed_at IS NULL;
      `;
      await sql.end();
    } catch (dbErr) {
      console.warn('DB update note:', dbErr);
    }

    // 2. Also ensure via Supabase Admin API
    try {
      const adminClient = createSupabaseAdmin();
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const targetUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );
      if (targetUser) {
        await adminClient.auth.admin.updateUserById(targetUser.id, {
          email_confirm: true,
        });
      }
    } catch (adminErr) {
      console.warn('Admin API note:', adminErr);
    }

    return NextResponse.json({ success: true, message: 'Emel berjaya disahkan.' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
