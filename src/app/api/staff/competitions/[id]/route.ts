import { NextResponse } from 'next/server';
import {
  getCompetitionDetailsWithQuestions,
  createQuestionRecord,
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
      return NextResponse.json({ success: false, error: 'ID pertandingan diperlukan' }, { status: 400 });
    }

    const data = await getCompetitionDetailsWithQuestions(id);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Pertandingan tidak ditemui' }, { status: 404 });
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
    const { id: competitionId } = await params;
    const body = await request.json();

    if (!body.questionText || !body.questionText.trim()) {
      return NextResponse.json({ success: false, error: 'Teks soalan diperlukan' }, { status: 400 });
    }

    const options = Array.isArray(body.options)
      ? body.options.map((o: string) => String(o).trim()).filter(Boolean)
      : [];

    if (options.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Sekurang-kurangnya 2 pilihan jawapan diperlukan' },
        { status: 400 }
      );
    }

    const correctAnswer = body.correctAnswer?.trim() || options[0];

    const created = await createQuestionRecord({
      quizId: competitionId,
      questionText: body.questionText.trim(),
      options,
      correctAnswer,
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
    const { id: competitionId } = await params;
    const body = await request.json();

    // 1. Edit Question
    if (body.questionId) {
      const qData: Record<string, any> = {};
      if (body.data?.questionText) qData.questionText = body.data.questionText.trim();
      if (Array.isArray(body.data?.options)) {
        qData.options = body.data.options.map((o: string) => String(o).trim()).filter(Boolean);
      }
      if (body.data?.correctAnswer) qData.correctAnswer = body.data.correctAnswer.trim();

      const updated = await updateAdminRecord('questions', body.questionId, qData);
      return NextResponse.json({ success: true, data: updated });
    }

    // 2. Edit Competition Details
    const compData = body.data || body;
    const updated = await updateAdminRecord('competitions', competitionId, compData);
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
    const { id: competitionId } = await params;
    const url = new URL(request.url);
    const questionId = url.searchParams.get('questionId');

    if (questionId) {
      await deleteAdminRecord('questions', questionId);
      return NextResponse.json({ success: true, message: 'Soalan berjaya dipadam' });
    }

    await deleteAdminRecord('competitions', competitionId);
    return NextResponse.json({ success: true, message: 'Pertandingan berjaya dipadam' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
