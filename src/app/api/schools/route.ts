import { NextResponse } from 'next/server';
import { getSchoolsList, createSchoolRecord } from '@/db/queries';
import { matchSchools } from '@/lib/school-matcher';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || undefined;

    const allSchools = await getSchoolsList(type);
    const matched = matchSchools(query, allSchools, 15);

    return NextResponse.json({
      success: true,
      data: matched,
    });
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
    const name = String(body.name || '').trim();
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nama sekolah diperlukan.' },
        { status: 400 }
      );
    }

    const upper = name.toUpperCase();
    let type = body.type;
    if (!type) {
      if (upper.includes('SMK') || upper.includes('MENENGAH')) {
        type = 'SMK';
      } else if (upper.includes('SMA')) {
        type = 'SMA';
      } else if (upper.includes('SJKC')) {
        type = 'SJKC';
      } else if (upper.includes('SJKT')) {
        type = 'SJKT';
      } else {
        type = 'SK';
      }
    }

    // Check if school with the same name already exists in database
    const allSchools = await getSchoolsList();
    const existing = allSchools.find(
      (s) => s.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        isExisting: true,
      });
    }

    const created = await createSchoolRecord({
      name,
      type: type.toUpperCase(),
      state: body.state || 'W.P. Kuala Lumpur',
      code: body.code || null,
      aliases: [name],
    });

    return NextResponse.json({ success: true, data: created, isExisting: false });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
