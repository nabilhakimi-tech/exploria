import { NextResponse } from 'next/server';
import { getParentAwards } from '@/db/queries';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId') || undefined;

    let parentId: string | undefined;
    try {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        parentId = user.id;
      }
    } catch {
      // Fallback
    }

    if (!parentId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const data = await getParentAwards(childId, parentId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
