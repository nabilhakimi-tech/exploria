import { NextResponse } from 'next/server';
import { getStudentProfile } from '@/db/queries';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId') || undefined;

    let userEmail: string | undefined;
    try {
      const supabase = await createSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) userEmail = user.email;
    } catch {
      // Fallback
    }

    const profile = await getStudentProfile(childId, userEmail);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profil pelajar tidak ditemui' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
