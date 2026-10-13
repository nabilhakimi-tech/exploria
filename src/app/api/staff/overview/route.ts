import { NextResponse } from 'next/server';
import { getStaffOverview } from '@/db/queries';

export async function GET() {
  try {
    const data = await getStaffOverview();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
