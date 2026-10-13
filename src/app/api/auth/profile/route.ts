import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getUserProfile, createOrUpdateProfile } from '@/db/queries';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await getUserProfile(user.id);
    if (!profile) {
      // Auto-create initial profile for the user
      profile = await createOrUpdateProfile({
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Pengguna Exploria',
        phone: user.user_metadata?.phone || undefined,
        role: (user.user_metadata?.role as 'parent' | 'staff' | 'admin' | 'student') || 'parent',
      });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const targetId = user?.id || body.id;

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updated = await createOrUpdateProfile({
      id: targetId,
      email: body.email || user?.email || '',
      fullName: body.fullName || body.username || 'Pengguna Exploria',
      phone: body.phone || (user?.user_metadata?.phone as string) || undefined,
      role: body.role || 'parent',
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
