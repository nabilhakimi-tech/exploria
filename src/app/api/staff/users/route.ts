import { NextResponse } from 'next/server';
import {
  getStaffUsers,
  createParentRecord,
  createStudentAdminRecord,
  deleteAdminRecord,
  updateAdminRecord,
  createOrUpdateProfile,
} from '@/db/queries';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const data = await getStaffUsers();
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
    const { type, ...data } = body;

    let result;
    if (type === 'parent') {
      result = await createParentRecord({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        icNumber: data.icNumber,
        isApproved: true,
      });
    } else if (type === 'student') {
      // If student has an email, provision Supabase Auth & profile so they can log in
      if (data.email) {
        const studentEmail = String(data.email).trim().toLowerCase();
        const studentPassword = String(data.password || 'Password123!').trim();
        try {
          const adminClient = createSupabaseAdmin();
          const { data: createdAuth } = await adminClient.auth.admin.createUser({
            email: studentEmail,
            password: studentPassword,
            email_confirm: true,
            user_metadata: {
              full_name: data.fullName,
              role: 'student',
            },
          });
          if (createdAuth?.user) {
            await createOrUpdateProfile({
              id: createdAuth.user.id,
              email: studentEmail,
              fullName: data.fullName,
              role: 'student',
            });
          }
        } catch {
          // Continue if already exists
        }
      }

      result = await createStudentAdminRecord({
        parentId: data.parentId,
        fullName: data.fullName,
        icNumber: data.icNumber,
        schoolType: data.schoolType || 'SK',
        grade: data.grade,
        schoolName: data.schoolName,
        gender: data.gender,
        email: data.email,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Jenis pengguna tidak sah' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'ID dan jenis pengguna diperlukan' },
        { status: 400 }
      );
    }

    const section = type === 'parent' ? 'parents' : 'students';
    const updated = await updateAdminRecord(section, id, data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'ID dan jenis pengguna diperlukan' },
        { status: 400 }
      );
    }

    const section = type === 'parent' ? 'parents' : 'students';
    await deleteAdminRecord(section, id);
    return NextResponse.json({ success: true, message: 'Pengguna berjaya dipadam' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
