import { NextResponse } from 'next/server';
import { getCompetitionsWithQuestions, submitExamAttempt } from '@/db/queries';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    let userEmail: string | undefined;
    try {
      const supabase = await createSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) userEmail = user.email;
    } catch {}

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId') || undefined;

    const data = await getCompetitionsWithQuestions(childId, userEmail);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let userEmail: string | undefined;
    try {
      const supabase = await createSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) userEmail = user.email;
    } catch {}

    const result = await submitExamAttempt({
      ...body,
      email: body.email || userEmail,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
