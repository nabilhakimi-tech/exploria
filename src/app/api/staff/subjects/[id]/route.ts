import { NextResponse } from 'next/server';
import {
  getSubjectDetailsWithChapters,
  createLessonMaterialRecord,
  updateAdminRecord,
  deleteAdminRecord,
} from '@/db/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID subjek diperlukan' }, { status: 400 });
    }

    const data = await getSubjectDetailsWithChapters(id);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Subjek tidak ditemui' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subjectId } = await params;
    const body = await request.json();

    let keyPointsArr: string[] | undefined = undefined;
    if (typeof body.keyPoints === 'string') {
      keyPointsArr = body.keyPoints.split('\n').map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(body.keyPoints)) {
      keyPointsArr = body.keyPoints;
    }

    let formulaArr: string[] | undefined = undefined;
    if (typeof body.formulaOrVocabulary === 'string') {
      formulaArr = body.formulaOrVocabulary.split('\n').map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(body.formulaOrVocabulary)) {
      formulaArr = body.formulaOrVocabulary;
    }

    const created = await createLessonMaterialRecord({
      subjectId,
      title: body.title || 'Bahan Baharu',
      type: body.type || 'notes',
      contentUrl: body.contentUrl || '',
      chapterTitle: body.chapterTitle || '',
      quizId: body.quizId || null,
      summary: body.summary || '',
      keyPoints: keyPointsArr,
      formulaOrVocabulary: formulaArr,
      examTip: body.examTip || '',
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { materialId, data } = body;

    if (!materialId || !data) {
      return NextResponse.json({ success: false, error: 'ID bahan diperlukan' }, { status: 400 });
    }

    let patchData = { ...data };
    if (typeof patchData.keyPoints === 'string') {
      patchData.keyPoints = patchData.keyPoints.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof patchData.formulaOrVocabulary === 'string') {
      patchData.formulaOrVocabulary = patchData.formulaOrVocabulary.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }

    const updated = await updateAdminRecord('materials', materialId, patchData);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('materialId');

    if (!materialId) {
      return NextResponse.json({ success: false, error: 'ID bahan diperlukan' }, { status: 400 });
    }

    const deleted = await deleteAdminRecord('materials', materialId);
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
