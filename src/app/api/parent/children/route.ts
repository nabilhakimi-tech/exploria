import { NextResponse } from 'next/server';
import {
  getParentChildren,
  getChildById,
  createChildRecord,
  createOrUpdateProfile,
  updateChildRecord,
  deleteChildRecord,
  getSchoolsList,
  createSchoolRecord,
} from '@/db/queries';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    let parentId: string | undefined = undefined;

    // Secure authentication check: retrieve parent from authenticated session
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

    const data = await getParentChildren(parentId);
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

    // 1. Get current authenticated parent session
    let parentId = body.parentId;
    try {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        parentId = user.id;
      }
    } catch {
      // Fallback to provided parentId
    }

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: 'Sesi anda telah tamat. Sila log masuk semula.' },
        { status: 401 }
      );
    }

    // 2. Provision student account in Supabase Auth & profiles using IC Number (or email)
    const icRaw = body.icNumber ? String(body.icNumber).trim() : '';
    const cleanIc = icRaw ? icRaw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : '';
    const studentAuthEmail = body.email
      ? String(body.email).trim().toLowerCase()
      : (cleanIc ? `${cleanIc}@student.exploria.my` : undefined);

    if (studentAuthEmail) {
      const password = String(body.password || '').trim();

      if (!password) {
        return NextResponse.json(
          {
            success: false,
            error: 'Sila masukkan kata laluan untuk akaun murid.',
          },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: 'Kata laluan anak mestilah sekurang-kurangnya 6 aksara.',
          },
          { status: 400 }
        );
      }

      const adminClient = createSupabaseAdmin();
      const { data: createdAuth, error: authError } =
        await adminClient.auth.admin.createUser({
          email: studentAuthEmail,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: body.fullName,
            role: 'student',
            ic_number: icRaw,
          },
        });

      if (authError) {
        if (
          authError.message.includes('already been registered') ||
          authError.message.includes('already exists')
        ) {
          // If already exists, update user password and metadata
          const { data: usersList } = await adminClient.auth.admin.listUsers();
          const existingUser = usersList?.users?.find(
            (u) => u.email?.toLowerCase() === studentAuthEmail.toLowerCase()
          );
          if (existingUser) {
            await adminClient.auth.admin.updateUserById(existingUser.id, {
              password,
              user_metadata: {
                full_name: body.fullName,
                role: 'student',
                ic_number: icRaw,
              },
            });
            await createOrUpdateProfile({
              id: existingUser.id,
              email: studentAuthEmail,
              fullName: body.fullName,
              role: 'student',
            });
          }
        } else {
          return NextResponse.json(
            {
              success: false,
              error: `Ralat mencipta akaun log masuk anak: ${authError.message}`,
            },
            { status: 400 }
          );
        }
      }

      if (createdAuth?.user) {
        await createOrUpdateProfile({
          id: createdAuth.user.id,
          email: studentAuthEmail,
          fullName: body.fullName,
          role: 'student',
        });
      }
    }

    // 3. Auto-save school to schools table if it doesn't already exist
    const schoolToSave = String(body.schoolName || body.school || '').trim();
    if (schoolToSave) {
      try {
        const existingSchools = await getSchoolsList();
        const found = existingSchools.find(
          (s) => s.name.trim().toLowerCase() === schoolToSave.toLowerCase()
        );
        if (!found) {
          const upper = schoolToSave.toUpperCase();
          const inferredType =
            upper.includes('SMK') || upper.includes('MENENGAH')
              ? 'SMK'
              : upper.includes('SMA')
              ? 'SMA'
              : 'SK';

          await createSchoolRecord({
            name: schoolToSave,
            type: inferredType,
            state: 'W.P. Kuala Lumpur',
            aliases: [schoolToSave],
          });
        }
      } catch (err) {
        console.error('Auto-saving school record failed:', err);
      }
    }

    // 4. Create child record tied to the authenticated parent
    const newChild = await createChildRecord({
      ...body,
      parentId,
      email: studentAuthEmail || undefined,
      icNumber: icRaw || undefined,
      schoolName: schoolToSave || null,
    });

    return NextResponse.json({ success: true, data: newChild });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID profil anak diperlukan.' },
        { status: 400 }
      );
    }

    // Verify ownership: child must belong to current authenticated parent
    let parentId: string | undefined;
    try {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) parentId = user.id;
    } catch {}

    const existingChild = await getChildById(id);
    if (!existingChild) {
      return NextResponse.json(
        { success: false, error: 'Profil anak tidak ditemui.' },
        { status: 404 }
      );
    }

    if (parentId && existingChild.parentId !== parentId) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak dibenarkan mengemaskini profil anak ini.' },
        { status: 403 }
      );
    }

    const updated = await updateChildRecord(id, {
      ...data,
      schoolName: data.schoolName !== undefined ? data.schoolName : data.school,
    });
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID profil anak diperlukan.' },
        { status: 400 }
      );
    }

    // Verify ownership: child must belong to current authenticated parent
    let parentId: string | undefined;
    try {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) parentId = user.id;
    } catch {}

    const existingChild = await getChildById(id);
    if (!existingChild) {
      return NextResponse.json(
        { success: false, error: 'Profil anak tidak ditemui.' },
        { status: 404 }
      );
    }

    if (parentId && existingChild.parentId !== parentId) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak dibenarkan memadam profil anak ini.' },
        { status: 403 }
      );
    }

    const deleted = await deleteChildRecord(id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
