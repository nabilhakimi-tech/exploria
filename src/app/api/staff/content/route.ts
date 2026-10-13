import { NextResponse } from 'next/server';
import {
  getStaffContent,
  createSubjectRecord,
  createQuestionRecord,
  createCompetitionRecord,
  deleteAdminRecord,
} from '@/db/queries';

export async function GET() {
  try {
    const data = await getStaffContent();
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
    if (type === 'subject') {
      result = await createSubjectRecord({
        title: data.title,
        description: data.description,
        category: data.category || 'SK',
      });
    } else if (type === 'question') {
      result = await createQuestionRecord({
        quizId: data.quizId,
        questionText: data.questionText,
        options: data.options,
        correctAnswer: data.correctAnswer,
      });
    } else if (type === 'competition') {
      result = await createCompetitionRecord({
        title: data.title,
        subjectId: data.subjectId,
        description: data.description,
        emoji: data.emoji || '🏆',
        difficulty: data.difficulty || 'SEDERHANA',
        durationMinutes: Number(data.durationMinutes) || 15,
        startTime: data.startTime ? new Date(data.startTime) : new Date(),
        endTime: data.endTime ? new Date(data.endTime) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Jenis kandungan tidak sah' },
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'ID dan jenis diperlukan' },
        { status: 400 }
      );
    }

    const section = type === 'subject' ? 'subjects' : type === 'question' ? 'questions' : 'competitions';
    await deleteAdminRecord(section, id);
    return NextResponse.json({ success: true, message: 'Kandungan berjaya dipadam' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
