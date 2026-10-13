import { NextResponse } from 'next/server';
import { db } from '@/db';
import { children, profiles } from '@/db/schema';
import { eq, or, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Sila masukkan emel atau No. IC.' },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim();

    // 1. If it contains @, it's already an email
    if (trimmed.includes('@')) {
      return NextResponse.json({
        success: true,
        email: trimmed.toLowerCase(),
      });
    }

    // 2. It's an IC or student ID without @
    const cleanIc = trimmed.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (!cleanIc) {
      return NextResponse.json(
        { success: false, error: 'No. IC tidak sah.' },
        { status: 400 }
      );
    }

    // Find in children table by IC Number (exact or with/without hyphens)
    const matchedChildren = await db
      .select({ email: children.email, icNumber: children.icNumber })
      .from(children)
      .where(
        or(
          eq(children.icNumber, trimmed),
          sql`REPLACE(REPLACE(LOWER(${children.icNumber}), '-', ''), ' ', '') = ${cleanIc}`
        )
      )
      .limit(1);

    if (matchedChildren.length > 0 && matchedChildren[0].email) {
      return NextResponse.json({
        success: true,
        email: matchedChildren[0].email,
      });
    }

    // Find in profiles table by IC Number
    const matchedProfiles = await db
      .select({ email: profiles.email, icNumber: profiles.icNumber })
      .from(profiles)
      .where(
        or(
          eq(profiles.icNumber, trimmed),
          sql`REPLACE(REPLACE(LOWER(${profiles.icNumber}), '-', ''), ' ', '') = ${cleanIc}`
        )
      )
      .limit(1);

    if (matchedProfiles.length > 0 && matchedProfiles[0].email) {
      return NextResponse.json({
        success: true,
        email: matchedProfiles[0].email,
      });
    }

    // Standard deterministic fallback for student IC accounts
    const deterministicEmail = `${cleanIc}@student.exploria.my`;
    return NextResponse.json({
      success: true,
      email: deterministicEmail,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
