import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { createOrUpdateProfile } from '@/db/queries';

export async function POST(request: Request) {
  try {
    const { username, email, phone, password } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, error: 'Sila lengkapkan nama pengguna, emel dan kata laluan.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(username).trim();
    const cleanPhone = phone ? String(phone).trim() : undefined;

    const adminClient = createSupabaseAdmin();

    // Create user with email_confirm: true so no email verification is EVER required
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: String(password).trim(),
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        phone: cleanPhone,
        role: 'parent',
      },
    });

    if (authError) {
      if (
        authError.message.includes('already been registered') ||
        authError.message.includes('already exists')
      ) {
        return NextResponse.json(
          { success: false, error: 'Emel ini telah didaftarkan. Sila log masuk ke akaun anda.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    if (authData?.user) {
      await createOrUpdateProfile({
        id: authData.user.id,
        email: cleanEmail,
        fullName: cleanName,
        phone: cleanPhone,
        role: 'parent',
      });
    }

    return NextResponse.json({ success: true, data: authData.user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
