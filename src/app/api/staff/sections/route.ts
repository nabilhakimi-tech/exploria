import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  subjects,
  lessonsMaterials,
  quizzesTournaments,
  questions,
  profiles,
  children,
  rewardsCertificates,
  announcements,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  getAdminMetadata,
  createSubjectRecord,
  createLessonMaterialRecord,
  createQuestionRecord,
  createCompetitionRecord,
  createParentRecord,
  createStudentAdminRecord,
  createAwardRecord,
  createAnnouncementRecord,
  deleteAdminRecord,
  updateAdminRecord,
  getPhysicalOrders,
  createOrUpdateProfile,
  ensureLessonMaterialsColumns,
} from '@/db/queries';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const meta = await getAdminMetadata();

    if (section === 'subjects') {
      await ensureLessonMaterialsColumns();
      const subs = await db.select().from(subjects).orderBy(subjects.category, subjects.title);
      const mats = await db.select().from(lessonsMaterials);
      const qzs = await db.select().from(quizzesTournaments);

      const subjectRecords = subs.map((sub) => {
        const subMats = mats.filter((m) => m.subjectId === sub.id);
        const matCount = subMats.length;
        const qzCount = qzs.filter((q) => q.subjectId === sub.id).length;
        return {
          id: sub.id,
          name: sub.title,
          description: sub.description || 'Modul Pembelajaran',
          marker: sub.title.includes('Sains') ? '🔬' : sub.title.includes('Math') ? '➗' : '📖',
          status: 'Aktif',
          values: [
            sub.category === 'SK' ? 'Darjah 1–6' : 'Tingkatan 1–5',
            `${matCount} bahan`,
            `${qzCount} kuiz`,
          ],
          subjectType: sub.category === 'SK' ? 'Teras' : 'STEM',
          category: sub.category,
          title: sub.title,
          itemType: 'subject',
          schoolLevels: [
            {
              schoolType: sub.category as 'SK' | 'SMK',
              levels:
                sub.category === 'SK'
                  ? Array.from({ length: 6 }, (_, i) => `Darjah ${i + 1}`)
                  : Array.from({ length: 5 }, (_, i) => `Tingkatan ${i + 1}`),
            },
          ],
        };
      });

      const materialRecords = mats.map((mat) => {
        const parentSub = subs.find((s) => s.id === mat.subjectId);
        const qz = qzs.find((q) => q.id === mat.quizId);
        const chapterLabel = mat.chapterTitle || qz?.title || 'Umum';
        const isNote = mat.type === 'notes';
        return {
          id: mat.id,
          name: mat.title,
          title: mat.title,
          description: `Bab: ${chapterLabel} · Subjek: ${parentSub?.title || 'Umum'} (${parentSub?.category || 'SK'})`,
          marker: mat.type === 'video' ? '🎥' : isNote ? '📝' : '📄',
          status: mat.type === 'video' ? 'Video' : isNote ? 'Nota Bab' : 'PDF',
          values: [
            parentSub?.category || 'SK',
            `Bab: ${chapterLabel}`,
            isNote
              ? 'Nota Bertulis (Intipati & Glosari)'
              : mat.type === 'video'
              ? 'Video Pembelajaran'
              : 'Dokumen PDF',
            isNote ? (mat.summary ? `${mat.summary.slice(0, 45)}...` : 'Teks Nota') : (mat.contentUrl || '-'),
          ],
          subjectType: parentSub?.category === 'SK' ? 'Teras' : 'STEM',
          subjectId: mat.subjectId,
          quizId: mat.quizId,
          chapterTitle: mat.chapterTitle || qz?.title || '',
          type: mat.type,
          contentUrl: mat.contentUrl,
          summary: mat.summary,
          keyPoints: mat.keyPoints,
          formulaOrVocabulary: mat.formulaOrVocabulary,
          examTip: mat.examTip,
          itemType: 'material',
        };
      });

      return NextResponse.json({ success: true, records: [...subjectRecords, ...materialRecords], meta });
    }

    if (section === 'questions') {
      const qList = await db.select().from(questions).orderBy(desc(questions.createdAt));
      const qzList = await db.select().from(quizzesTournaments);

      const records = qList.map((q) => {
        const quiz = qzList.find((qz) => qz.id === q.quizId);
        const optCount = Array.isArray(q.options) ? (q.options as string[]).length : 4;
        return {
          id: q.id,
          name: q.questionText,
          description: quiz?.title || 'Kuiz Exploria',
          marker: '❓',
          status: 'Disahkan',
          values: [
            quiz?.title || 'Umum',
            `${optCount} pilihan`,
            `Jawapan: ${q.correctAnswer}`,
          ],
          quizId: q.quizId,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
        };
      });

      return NextResponse.json({ success: true, records, meta });
    }

    if (section === 'competitions') {
      const comps = await db
        .select()
        .from(quizzesTournaments)
        .where(eq(quizzesTournaments.isTournament, true))
        .orderBy(desc(quizzesTournaments.isActive), quizzesTournaments.title);
      const subs = await db.select().from(subjects);
      const allQuestions = await db.select().from(questions).orderBy(questions.createdAt);

      const records = comps.map((c) => {
        const sub = subs.find((s) => s.id === c.subjectId);
        const compQuestions = allQuestions.filter((q) => q.quizId === c.id);

        return {
          id: c.id,
          name: c.title,
          title: c.title,
          description: c.description || 'Pertandingan rasmi Exploria',
          marker: c.emoji || '🏆',
          status: c.isActive ? 'Sedang Berlangsung' : 'Dijadualkan',
          isActive: c.isActive,
          values: [
            sub?.title || 'Umum',
            `${c.durationMinutes || 10} minit`,
            `${compQuestions.length} soalan`,
          ],
          subjectId: c.subjectId,
          difficulty: c.difficulty || 'SEDERHANA',
          durationMinutes: c.durationMinutes || 10,
          emoji: c.emoji || '🏆',
          questionCount: compQuestions.length,
          questions: compQuestions.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            options: q.options as string[],
            correctAnswer: q.correctAnswer,
          })),
        };
      });

      return NextResponse.json({ success: true, records, meta });
    }

    if (section === 'parents') {
      const parentList = await db
        .select()
        .from(profiles)
        .where(eq(profiles.role, 'parent'))
        .orderBy(profiles.fullName);
      const childList = await db.select().from(children);

      const records = parentList.map((p) => {
        const cCount = childList.filter((c) => c.parentId === p.id).length;
        return {
          id: p.id,
          name: p.fullName,
          fullName: p.fullName,
          description: p.email,
          email: p.email,
          phone: p.phone,
          icNumber: p.icNumber,
          marker: '👨‍👩‍👧',
          status: 'Aktif',
          values: [
            p.phone || '012-XXXXXXX',
            `${cCount} anak berdaftar`,
            p.email,
          ],
        };
      });

      return NextResponse.json({ success: true, records, meta });
    }

    if (section === 'students') {
      const studentList = await db.select().from(children).orderBy(children.fullName);
      const parentList = await db.select().from(profiles);

      const records = studentList.map((s) => {
        const parent = parentList.find((p) => p.id === s.parentId);
        return {
          id: s.id,
          name: s.fullName,
          fullName: s.fullName,
          description: `${s.schoolType} · ${s.grade}`,
          marker: s.avatarUrl || '🧑‍🚀',
          status: 'Aktif',
          values: [
            `Ibu Bapa: ${parent?.fullName || 'Penjaga'}`,
            s.schoolName || `${s.schoolType} ${s.grade}`,
            s.email || `${s.fullName.toLowerCase().replace(/\s+/g, '.')}@exploria.my`,
          ],
          email: s.email,
          parentId: s.parentId,
          schoolType: s.schoolType,
          grade: s.grade,
          schoolName: s.schoolName,
          gender: s.gender,
        };
      });

      return NextResponse.json({ success: true, records, meta });
    }

    if (section === 'awards') {
      const awardList = await db
        .select()
        .from(rewardsCertificates)
        .orderBy(desc(rewardsCertificates.awardedAt));
      const studentList = await db.select().from(children);
      const orders = await getPhysicalOrders();

      const awardRecords = awardList.map((a) => {
        const student = studentList.find((s) => s.id === a.childId);
        const icon =
          a.type === 'medal_gold'
            ? '🏆'
            : a.type === 'medal_silver'
            ? '🥈'
            : a.type === 'medal_bronze'
            ? '🥉'
            : '📜';

        return {
          id: a.id,
          name: a.title,
          title: a.title,
          description: `Dianugerahkan kepada ${student?.fullName || 'Pelajar'}`,
          marker: icon,
          status: 'Rasmi',
          itemType: 'award' as const,
          values: [
            student?.fullName || 'Pelajar',
            a.certId || 'EXP-CERT-2026',
            `Markah: ${a.score || 100}%`,
          ],
          childId: a.childId,
          type: a.type,
          score: a.score,
          competitionTitle: a.competitionTitle,
        };
      });

      const orderRecords = orders.map((o) => {
        return {
          id: o.id,
          name: `Pesanan: ${o.orderNumber}`,
          title: o.orderNumber,
          description: `${o.productName} · Pelajar: ${o.childName || 'Anak'}`,
          marker: '📦',
          status: o.status || 'Baru',
          itemType: 'order' as const,
          values: [
            `${o.guardianName} (${o.phone})`,
            o.deliveryAddress,
            `RM ${o.totalAmount}.00`,
          ],
          phone: o.phone,
          guardianName: o.guardianName,
          deliveryAddress: o.deliveryAddress,
          trackingNumber: o.trackingNumber,
          productName: o.productName,
          totalAmount: o.totalAmount,
          orderNumber: o.orderNumber,
          childName: o.childName,
          awardTitle: o.awardTitle,
        };
      });

      // Place orders first so pending orders are immediately visible
      const records = [...orderRecords, ...awardRecords];

      return NextResponse.json({
        success: true,
        records,
        meta: {
          ...meta,
          totalOrders: orderRecords.length,
          pendingOrders: orderRecords.filter((o) => o.status === 'Baru').length,
        },
      });
    }

    if (section === 'announcements') {
      const annList = await db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.createdAt));

      const records = annList.map((a) => ({
        id: a.id,
        name: a.title,
        title: a.title,
        description: a.content,
        content: a.content,
        marker: '📢',
        status: a.isActive ? 'Aktif' : 'Arkib',
        isActive: a.isActive,
        category: a.category || 'Umum',
        targetAudience: a.targetAudience || 'Semua',
        values: [
          a.category || 'Umum',
          a.targetAudience || 'Semua',
          new Date(a.createdAt).toLocaleDateString('ms-MY'),
        ],
      }));

      return NextResponse.json({ success: true, records, meta });
    }

    if (section === 'settings') {
      return NextResponse.json({
        success: true,
        records: [],
        meta,
        adminProfile: meta.adminProfile,
      });
    }

    return NextResponse.json({ success: true, records: [], meta });
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
    const { section, ...data } = body;

    let result;
    if (section === 'subjects') {
      if (data.isMaterial) {
        let keyPoints = data.keyPoints;
        if (typeof keyPoints === 'string') {
          keyPoints = keyPoints.split('\n').map((s: string) => s.trim()).filter(Boolean);
        }
        let formulaOrVocabulary = data.formulaOrVocabulary;
        if (typeof formulaOrVocabulary === 'string') {
          formulaOrVocabulary = formulaOrVocabulary.split('\n').map((s: string) => s.trim()).filter(Boolean);
        }

        result = await createLessonMaterialRecord({
          subjectId: data.subjectId,
          quizId: data.quizId || undefined,
          chapterTitle: data.chapterTitle || undefined,
          title: data.title,
          type: data.type || (data.summary ? 'notes' : 'pdf'),
          contentUrl: data.contentUrl || '',
          summary: data.summary || undefined,
          keyPoints: Array.isArray(keyPoints) ? keyPoints : undefined,
          formulaOrVocabulary: Array.isArray(formulaOrVocabulary) ? formulaOrVocabulary : undefined,
          examTip: data.examTip || undefined,
        });
      } else {
        result = await createSubjectRecord({
          title: data.title,
          description: data.description,
          category: data.category || 'SK',
        });
      }
    } else if (section === 'questions') {
      result = await createQuestionRecord({
        quizId: data.quizId,
        questionText: data.questionText,
        options: data.options,
        correctAnswer: data.correctAnswer,
      });
    } else if (section === 'competitions') {
      result = await createCompetitionRecord({
        title: data.title,
        subjectId: data.subjectId,
        description: data.description,
        emoji: data.emoji || '🏆',
        difficulty: data.difficulty || 'SEDERHANA',
        durationMinutes: Number(data.durationMinutes) || 15,
        startTime: data.startTime ? new Date(data.startTime) : new Date(),
        endTime: data.endTime ? new Date(data.endTime) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: data.isActive ?? true,
      });
    } else if (section === 'parents') {
      result = await createParentRecord({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        icNumber: data.icNumber,
        isApproved: true,
      });
    } else if (section === 'students') {
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
        } catch {}
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
    } else if (section === 'awards') {
      result = await createAwardRecord({
        childId: data.childId,
        type: data.type || 'badge',
        title: data.title,
        description: data.description,
        score: Number(data.score) || 100,
        competitionTitle: data.competitionTitle,
      });
    } else if (section === 'announcements') {
      result = await createAnnouncementRecord({
        title: data.title,
        content: data.content,
        category: data.category,
        targetAudience: data.targetAudience,
        isActive: data.isActive ?? true,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak sah' },
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
    const { section, id, data } = body;

    if (!section || !id) {
      return NextResponse.json(
        { success: false, error: 'ID dan section diperlukan' },
        { status: 400 }
      );
    }

    let patchData = { ...data };
    if (section === 'materials') {
      if (typeof patchData.keyPoints === 'string') {
        patchData.keyPoints = patchData.keyPoints.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
      if (typeof patchData.formulaOrVocabulary === 'string') {
        patchData.formulaOrVocabulary = patchData.formulaOrVocabulary.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    const updated = await updateAdminRecord(section, id, patchData);
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
    const section = searchParams.get('section');
    const id = searchParams.get('id');

    if (!section || !id) {
      return NextResponse.json(
        { success: false, error: 'ID dan section diperlukan' },
        { status: 400 }
      );
    }

    await deleteAdminRecord(section, id);
    return NextResponse.json({ success: true, message: 'Berjaya dipadamkan' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
