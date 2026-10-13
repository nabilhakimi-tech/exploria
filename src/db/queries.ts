import { db } from './index';
import {
  profiles,
  children,
  subjects,
  lessonsMaterials,
  quizzesTournaments,
  questions,
  quizAttempts,
  rewardsCertificates,
  announcements,
  physicalOrders,
  schools,
  type Child,
  type NewChild,
  type QuizTournament,
  type RewardCertificate,
  type PhysicalOrder,
  type School,
} from './schema';
import { eq, desc, sql, and } from 'drizzle-orm';

// ─── 1. PARENT PORTAL QUERIES ────────────────────────────────────────────────
export async function getParentChildren(parentId?: string) {
  if (parentId) {
    return await db
      .select()
      .from(children)
      .where(eq(children.parentId, parentId))
      .orderBy(children.createdAt);
  }
  return [];
}

export async function getChildById(childId: string) {
  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);
  return child || null;
}

export async function createChildRecord(data: {
  parentId?: string;
  fullName: string;
  email?: string;
  icNumber?: string;
  schoolType: 'SK' | 'SMK';
  grade: string;
  schoolName?: string;
  gender?: string;
  color?: string;
  avatarUrl?: string;
}) {
  if (!data.parentId) {
    throw new Error('ID Ibu Bapa (parentId) diperlukan untuk mendaftar anak.');
  }
  const effectiveParentId = data.parentId;

  try {
    await db.execute(sql`ALTER TABLE children ADD COLUMN IF NOT EXISTS ic_number text;`);
  } catch {}

  const [inserted] = await db
    .insert(children)
    .values({
      parentId: effectiveParentId,
      fullName: data.fullName,
      email: data.email ? data.email.toLowerCase().trim() : null,
      icNumber: data.icNumber ? data.icNumber.trim() : null,
      schoolType: data.schoolType || (data.schoolName?.toUpperCase().includes('SMK') || data.schoolName?.toUpperCase().includes('SMA') ? 'SMK' : 'SK'),
      grade: data.grade || '-',
      schoolName: data.schoolName || null,
      gender: data.gender || 'Tidak dinyatakan',
      color: data.color || '#5aa99b',
      avatarUrl: data.avatarUrl || '👦',
      xp: 0,
      level: 1,
    })
    .returning();

  return inserted;
}

export async function updateChildRecord(childId: string, data: {
  fullName?: string;
  icNumber?: string;
  schoolType?: 'SK' | 'SMK';
  grade?: string;
  schoolName?: string;
  gender?: string;
  color?: string;
  avatarUrl?: string;
  email?: string;
}) {
  const [updated] = await db
    .update(children)
    .set({
      ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      ...(data.icNumber !== undefined ? { icNumber: data.icNumber } : {}),
      ...(data.schoolType !== undefined ? { schoolType: data.schoolType } : {}),
      ...(data.grade !== undefined ? { grade: data.grade } : {}),
      ...(data.schoolName !== undefined ? { schoolName: data.schoolName } : {}),
      ...(data.gender !== undefined ? { gender: data.gender } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      ...(data.email !== undefined ? { email: data.email ? data.email.toLowerCase().trim() : null } : {}),
    })
    .where(eq(children.id, childId))
    .returning();

  return updated;
}

export async function deleteChildRecord(childId: string) {
  const [deleted] = await db
    .delete(children)
    .where(eq(children.id, childId))
    .returning();

  return deleted;
}

export async function getParentQuizActivities(childId?: string, parentId?: string) {
  if (!parentId && (!childId || childId === 'all')) {
    return [];
  }

  const query = db
    .select({
      id: quizAttempts.id,
      childId: quizAttempts.childId,
      childName: children.fullName,
      quizId: quizAttempts.quizId,
      quizTitle: quizzesTournaments.title,
      score: quizAttempts.score,
      passed: quizAttempts.passed,
      xpEarned: quizAttempts.xpEarned,
      completedAt: quizAttempts.completedAt,
    })
    .from(quizAttempts)
    .innerJoin(children, eq(quizAttempts.childId, children.id))
    .innerJoin(quizzesTournaments, eq(quizAttempts.quizId, quizzesTournaments.id))
    .orderBy(desc(quizAttempts.completedAt));

  if (parentId && childId && childId !== 'all') {
    return await query.where(and(eq(children.parentId, parentId), eq(quizAttempts.childId, childId)));
  } else if (parentId) {
    return await query.where(eq(children.parentId, parentId));
  } else if (childId && childId !== 'all') {
    return await query.where(eq(quizAttempts.childId, childId));
  }
  return [];
}

export async function getParentAwards(childId?: string, parentId?: string) {
  if (!parentId && (!childId || childId === 'all')) {
    return [];
  }

  const query = db
    .select({
      id: rewardsCertificates.id,
      childId: rewardsCertificates.childId,
      childName: children.fullName,
      childSchool: children.schoolName,
      type: rewardsCertificates.type,
      title: rewardsCertificates.title,
      description: rewardsCertificates.description,
      qrCodeHash: rewardsCertificates.qrCodeHash,
      certId: rewardsCertificates.certId,
      score: rewardsCertificates.score,
      competitionTitle: rewardsCertificates.competitionTitle,
      awardedAt: rewardsCertificates.awardedAt,
    })
    .from(rewardsCertificates)
    .innerJoin(children, eq(rewardsCertificates.childId, children.id))
    .orderBy(desc(rewardsCertificates.awardedAt));

  if (parentId && childId && childId !== 'all') {
    return await query.where(and(eq(children.parentId, parentId), eq(rewardsCertificates.childId, childId)));
  } else if (parentId) {
    return await query.where(eq(children.parentId, parentId));
  } else if (childId && childId !== 'all') {
    return await query.where(eq(rewardsCertificates.childId, childId));
  }
  return [];
}

// ─── 2. STUDENT PORTAL QUERIES ───────────────────────────────────────────────
export async function getStudentQuizzes() {
  const quizList = await db
    .select({
      id: quizzesTournaments.id,
      title: quizzesTournaments.title,
      description: quizzesTournaments.description,
      subjectId: quizzesTournaments.subjectId,
      subjectTitle: subjects.title,
      subjectCategory: subjects.category,
      difficulty: quizzesTournaments.difficulty,
      emoji: quizzesTournaments.emoji,
      durationMinutes: quizzesTournaments.durationMinutes,
      isTournament: quizzesTournaments.isTournament,
      isActive: quizzesTournaments.isActive,
    })
    .from(quizzesTournaments)
    .innerJoin(subjects, eq(quizzesTournaments.subjectId, subjects.id))
    .orderBy(desc(quizzesTournaments.isTournament), quizzesTournaments.title);

  const quizzesWithQuestions = await Promise.all(
    quizList.map(async (quiz) => {
      const [qList, mList] = await Promise.all([
        db
          .select()
          .from(questions)
          .where(eq(questions.quizId, quiz.id))
          .orderBy(questions.createdAt),
        db
          .select()
          .from(lessonsMaterials)
          .where(eq(lessonsMaterials.subjectId, quiz.subjectId))
          .orderBy(lessonsMaterials.createdAt),
      ]);

      // Cari nota rujukan bab yang ditulis oleh admin jika ada
      const customNote = mList.find(
        (m) =>
          m.type === 'notes' &&
          ((m.quizId && m.quizId === quiz.id) ||
            (m.chapterTitle &&
              m.chapterTitle.toLowerCase().trim() === quiz.title.toLowerCase().trim()) ||
            (!m.quizId && !m.chapterTitle && m.summary))
      );

      const studyNotes = customNote && customNote.summary
        ? {
            summary: customNote.summary,
            keyPoints: Array.isArray(customNote.keyPoints) && customNote.keyPoints.length > 0
              ? customNote.keyPoints
              : [],
            formulaOrVocabulary: Array.isArray(customNote.formulaOrVocabulary) && customNote.formulaOrVocabulary.length > 0
              ? customNote.formulaOrVocabulary
              : [],
            examTip: customNote.examTip || '',
          }
        : undefined;

      return {
        ...quiz,
        studyNotes,
        materials: mList.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          contentUrl: m.contentUrl || '',
          chapterTitle: m.chapterTitle || undefined,
          summary: m.summary || undefined,
          keyPoints: m.keyPoints || undefined,
          formulaOrVocabulary: m.formulaOrVocabulary || undefined,
          examTip: m.examTip || undefined,
        })),
        questions: qList.map((q, idx) => ({
          id: idx + 1,
          dbId: q.id,
          question: q.questionText,
          options: q.options as string[],
          correctAnswer: q.correctAnswer,
          correctIndex: (q.options as string[]).indexOf(q.correctAnswer),
        })),
      };
    })
  );

  return quizzesWithQuestions;
}

export async function ensureCompetitionColumns() {
  try {
    await db.execute(sql`ALTER TABLE quizzes_tournaments ADD COLUMN IF NOT EXISTS last_opened_at timestamp with time zone DEFAULT now();`);
  } catch {}
}

export async function getCompetitionsWithQuestions(childId?: string, email?: string) {
  await ensureCompetitionColumns();
  let effectiveChildId: string | null = null;
  try {
    effectiveChildId = await resolveStudentTargetId(childId, email);
  } catch {}

  const comps = await db
    .select({
      id: quizzesTournaments.id,
      title: quizzesTournaments.title,
      description: quizzesTournaments.description,
      subjectTitle: subjects.title,
      emoji: quizzesTournaments.emoji,
      difficulty: quizzesTournaments.difficulty,
      durationMinutes: quizzesTournaments.durationMinutes,
      isTournament: quizzesTournaments.isTournament,
      startTime: quizzesTournaments.startTime,
      endTime: quizzesTournaments.endTime,
      isActive: quizzesTournaments.isActive,
      lastOpenedAt: quizzesTournaments.lastOpenedAt,
      createdAt: quizzesTournaments.createdAt,
    })
    .from(quizzesTournaments)
    .innerJoin(subjects, eq(quizzesTournaments.subjectId, subjects.id))
    .where(eq(quizzesTournaments.isTournament, true))
    .orderBy(desc(quizzesTournaments.isActive), quizzesTournaments.startTime);

  let studentAttempts: any[] = [];
  let studentCerts: any[] = [];
  if (effectiveChildId) {
    try {
      studentAttempts = await db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.childId, effectiveChildId))
        .orderBy(desc(quizAttempts.completedAt));
    } catch {}
    try {
      studentCerts = await db
        .select()
        .from(rewardsCertificates)
        .where(eq(rewardsCertificates.childId, effectiveChildId))
        .orderBy(desc(rewardsCertificates.awardedAt));
    } catch {}
  }

  const compsWithQ = await Promise.all(
    comps.map(async (comp) => {
      const qList = await db
        .select()
        .from(questions)
        .where(eq(questions.quizId, comp.id))
        .orderBy(questions.createdAt);

      const cycleTimestamp = comp.lastOpenedAt
        ? new Date(comp.lastOpenedAt).getTime()
        : new Date(comp.createdAt).getTime();

      // Find attempt made during this active cycle (at or after lastOpenedAt)
      const attemptInCurrentCycle = studentAttempts.find(
        (att) => att.quizId === comp.id && new Date(att.completedAt).getTime() >= cycleTimestamp
      );

      const hasAttempted = Boolean(attemptInCurrentCycle);

      // Find matching certificate if available
      const matchingCert = studentCerts.find(
        (c) =>
          (c.competitionTitle && c.competitionTitle.toLowerCase().includes(comp.title.toLowerCase())) ||
          (c.title && c.title.toLowerCase().includes(comp.title.toLowerCase())) ||
          (c.certId && c.certId.includes(comp.id))
      );

      return {
        ...comp,
        hasAttempted,
        attemptScore: attemptInCurrentCycle ? attemptInCurrentCycle.score : null,
        attemptPassed: attemptInCurrentCycle ? attemptInCurrentCycle.passed : null,
        attemptCompletedAt: attemptInCurrentCycle ? attemptInCurrentCycle.completedAt : null,
        certData: matchingCert
          ? {
              certId: matchingCert.certId || matchingCert.qrCodeHash || '',
              awardLevel:
                matchingCert.type === 'medal_gold'
                  ? 'EMAS'
                  : matchingCert.type === 'medal_silver'
                  ? 'PERAK'
                  : matchingCert.type === 'medal_bronze'
                  ? 'GANGSA'
                  : 'PENYERTAAN',
              score: matchingCert.score || 0,
              competitionTitle: matchingCert.competitionTitle || comp.title,
            }
          : null,
        questions: qList.map((q, idx) => ({
          id: idx + 1,
          dbId: q.id,
          question: q.questionText,
          options: q.options as string[],
          correctAnswer: q.correctAnswer,
          correctIndex: (q.options as string[]).indexOf(q.correctAnswer),
        })),
      };
    })
  );

  return compsWithQ;
}

export async function submitExamAttempt(data: {
  childId?: string;
  email?: string;
  quizId?: string;
  score: number;
  passed: boolean;
  xpEarned: number;
  certData?: {
    certId: string;
    competitionTitle: string;
    awardLevel: 'EMAS' | 'PERAK' | 'GANGSA' | 'PENYERTAAN';
    score: number;
  };
}) {
  let effectiveChildId = await resolveStudentTargetId(data.childId, data.email);
  if (!effectiveChildId) {
    const [firstChild] = await db.select().from(children).orderBy(children.createdAt).limit(1);
    effectiveChildId = firstChild?.id || 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  }

  // Fallback quizId if from a game (e.g. Spelling Bee or Sifir)
  let targetQuizId = data.quizId;
  if (!targetQuizId) {
    const [defaultQuiz] = await db.select().from(quizzesTournaments).limit(1);
    targetQuizId = defaultQuiz?.id || 'ca444444-cccc-cccc-cccc-cccccccccccc';
  }

  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      childId: effectiveChildId,
      quizId: targetQuizId,
      score: data.score,
      passed: data.passed,
      xpEarned: data.xpEarned,
    })
    .returning();

  // Fetch current child stats
  const [currentChild] = await db
    .select({
      id: children.id,
      xp: children.xp,
      level: children.level,
      coins: children.coins,
    })
    .from(children)
    .where(eq(children.id, effectiveChildId))
    .limit(1);

  const prevLevel = currentChild?.level || 1;
  const newXp = (currentChild?.xp || 0) + (data.xpEarned || 0);
  const newLevel = Math.floor(newXp / 250) + 1;
  const leveledUp = newLevel > prevLevel;

  // Update child XP and Level
  const [updatedChild] = await db
    .update(children)
    .set({
      xp: newXp,
      level: newLevel,
    })
    .where(eq(children.id, effectiveChildId))
    .returning({
      id: children.id,
      xp: children.xp,
      level: children.level,
      coins: children.coins,
    });

  // If student passed and earned a recognized rank award, record in rewards_certificates
  if (data.certData && data.passed) {
    const typeEnum =
      data.certData.awardLevel === 'EMAS'
        ? 'medal_gold'
        : data.certData.awardLevel === 'PERAK'
        ? 'medal_silver'
        : data.certData.awardLevel === 'GANGSA'
        ? 'medal_bronze'
        : null;

    if (typeEnum) {
      await db.insert(rewardsCertificates).values({
        childId: effectiveChildId,
        type: typeEnum,
        title: `${data.certData.competitionTitle} (${data.certData.awardLevel})`,
        description: `Peperiksaan rasmi disahkan dengan markah ${data.certData.score}%`,
        qrCodeHash: data.certData.certId,
        certId: data.certData.certId,
        score: data.certData.score,
        competitionTitle: data.certData.competitionTitle,
      });
    }
  }

  return {
    ...attempt,
    xpEarned: data.xpEarned,
    newXp,
    newLevel,
    previousLevel: prevLevel,
    leveledUp,
    coins: updatedChild?.coins ?? 200,
  };
}

// ─── 3. STAFF & ADMIN QUERIES ────────────────────────────────────────────────
export async function getStaffOverview() {
  const [totalAttempts] = await db.select({ count: sql<number>`count(*)::int` }).from(quizAttempts);
  const [totalStudents] = await db.select({ count: sql<number>`count(*)::int` }).from(children);
  const [totalSubjects] = await db.select({ count: sql<number>`count(*)::int` }).from(subjects);
  const [totalQuizzes] = await db.select({ count: sql<number>`count(*)::int` }).from(quizzesTournaments);
  const [totalParents] = await db.select({ count: sql<number>`count(*)::int` }).from(profiles).where(eq(profiles.role, 'parent'));
  const [totalAwards] = await db.select({ count: sql<number>`count(*)::int` }).from(rewardsCertificates);

  const studentList = await db.select({ level: children.level }).from(children);
  const level1 = studentList.filter((s) => s.level <= 1).length;
  const level2 = studentList.filter((s) => s.level === 2).length;
  const level3 = studentList.filter((s) => s.level >= 3).length;

  return {
    totalQuizzesAnswered: totalAttempts?.count || 0,
    totalStudents: totalStudents?.count || 0,
    totalSubjects: totalSubjects?.count || 0,
    totalQuizzesCreated: totalQuizzes?.count || 0,
    totalParents: totalParents?.count || 0,
    totalAwards: totalAwards?.count || 0,
    levelBreakdown: { level1, level2, level3 },
  };
}


export async function getStaffUsers() {
  const parentsList = await db
    .select({
      id: profiles.id,
      name: profiles.fullName,
      email: profiles.email,
      phone: profiles.phone,
      icNumber: profiles.icNumber,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.role, 'parent'))
    .orderBy(profiles.fullName);

  const studentsList = await db
    .select({
      id: children.id,
      name: children.fullName,
      email: children.email,
      icNumber: children.icNumber,
      parentId: children.parentId,
      parentName: profiles.fullName,
      schoolType: children.schoolType,
      grade: children.grade,
      schoolName: children.schoolName,
      gender: children.gender,
      xp: children.xp,
      level: children.level,
      avatarUrl: children.avatarUrl,
      createdAt: children.createdAt,
    })
    .from(children)
    .innerJoin(profiles, eq(children.parentId, profiles.id))
    .orderBy(children.fullName);

  const parentsWithCount = parentsList.map((p) => {
    const childCount = studentsList.filter((s) => s.parentId === p.id).length;
    return {
      ...p,
      children: childCount,
    };
  });

  return {
    parents: parentsWithCount,
    students: studentsList,
  };
}

export async function getStaffContent() {
  const subjectsList = await db.select().from(subjects).orderBy(subjects.category, subjects.title);
  const materialsList = await db.select().from(lessonsMaterials).orderBy(lessonsMaterials.createdAt);
  const quizzesList = await db.select().from(quizzesTournaments).orderBy(quizzesTournaments.title);
  const questionsList = await db.select().from(questions).orderBy(questions.createdAt);

  const subjectsWithCounts = subjectsList.map((sub) => {
    const matCount = materialsList.filter((m) => m.subjectId === sub.id).length;
    const qCount = quizzesList.filter((q) => q.subjectId === sub.id).length;
    return {
      id: sub.id,
      title: sub.title,
      category: sub.category,
      description: sub.description,
      materials: matCount,
      quizzes: qCount,
    };
  });

  const tournamentsList = quizzesList
    .filter((q) => q.isTournament)
    .map((t) => {
      const sub = subjectsList.find((s) => s.id === t.subjectId);
      return {
        id: t.id,
        title: t.title,
        subject: sub?.title || 'Umum',
        start: t.startTime ? new Date(t.startTime).toLocaleDateString('ms-MY') : '1 Okt 2026',
        end: t.endTime ? new Date(t.endTime).toLocaleDateString('ms-MY') : '20 Okt 2026',
        status: t.isActive ? 'Sedang Berlangsung' : 'Dijadualkan',
      };
    });

  const previewQuestions = questionsList.map((q) => {
    const quiz = quizzesList.find((qz) => qz.id === q.quizId);
    return {
      id: q.id,
      quizName: quiz?.title || 'Kuiz Exploria',
      preview: q.questionText,
      answers: Array.isArray(q.options) ? (q.options as string[]).length : 4,
    };
  });

  return {
    subjects: subjectsWithCounts,
    tournaments: tournamentsList,
    questions: previewQuestions,
  };
}

// ─── 4. AUTH & USER PROFILES ─────────────────────────────────────────────────
export async function getUserProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return profile || null;
}

export async function createOrUpdateProfile(data: {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: 'parent' | 'staff' | 'admin' | 'student';
}) {
  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, data.id))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(profiles)
      .set({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || existing.phone,
        role: data.role || existing.role,
      })
      .where(eq(profiles.id, data.id))
      .returning();
    return updated;
  }

  const [inserted] = await db
    .insert(profiles)
    .values({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone || null,
      role: data.role || 'parent',
      isApproved: true,
    })
    .returning();

  return inserted;
}

// ─── 5. STUDENT PORTAL DATA QUERIES ──────────────────────────────────────────
export async function resolveStudentTargetId(childId?: string, email?: string): Promise<string | null> {
  // 1. If explicit childId provided, check if valid
  if (childId) {
    const [found] = await db
      .select({ id: children.id })
      .from(children)
      .where(eq(children.id, childId))
      .limit(1);
    if (found) return found.id;
  }

  // 2. If email provided, find child by email (case-insensitive & trimmed)
  if (email && email.trim()) {
    const cleanEmail = email.toLowerCase().trim();
    const [childByEmail] = await db
      .select({ id: children.id })
      .from(children)
      .where(sql`lower(trim(${children.email})) = ${cleanEmail}`)
      .limit(1);
    if (childByEmail) return childByEmail.id;

    // 3. If not found in children table directly, check if profiles has this email
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(sql`lower(trim(${profiles.email})) = ${cleanEmail}`)
      .limit(1);

    if (userProfile) {
      // Try finding child with matching full_name
      const [childByName] = await db
        .select({ id: children.id })
        .from(children)
        .where(sql`lower(trim(${children.fullName})) = lower(trim(${userProfile.fullName}))`)
        .limit(1);

      if (childByName) {
        // Link email to this child for future instant lookup
        try {
          await db
            .update(children)
            .set({ email: cleanEmail })
            .where(eq(children.id, childByName.id));
        } catch {}
        return childByName.id;
      }

      // If user profile has role student but no child record exists yet, auto-provision one
      if (userProfile.role === 'student') {
        const [defaultParent] = await db
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.role, 'parent'))
          .limit(1);
        const effectiveParentId = defaultParent?.id || userProfile.id;
        const [newChild] = await db
          .insert(children)
          .values({
            parentId: effectiveParentId,
            fullName: userProfile.fullName,
            email: cleanEmail,
            schoolType: 'SK',
            grade: 'Darjah 4',
            avatarUrl: '👦',
            xp: 0,
            level: 1,
          })
          .returning({ id: children.id });
        if (newChild) return newChild.id;
      }
    }
  }

  // 4. Fallback only if neither childId nor email was provided
  if (!childId && (!email || !email.trim())) {
    const [firstChild] = await db
      .select({ id: children.id })
      .from(children)
      .orderBy(children.createdAt)
      .limit(1);
    return firstChild?.id || null;
  }

  return null;
}

export async function getStudentProfile(childId?: string, email?: string) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) return null;

  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, targetChildId))
    .limit(1);

  if (!child) return null;

  // Aggregate stats from real database tables
  const attempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.childId, targetChildId));

  const awards = await db
    .select()
    .from(rewardsCertificates)
    .where(eq(rewardsCertificates.childId, targetChildId));

  const passedCount = attempts.filter((a) => a.passed).length;
  const totalScore = attempts.reduce((acc, cur) => acc + (cur.score > 10 ? cur.score : (cur.score / 10) * 100), 0);
  const averageScore = attempts.length > 0 ? Math.min(Math.round(totalScore / attempts.length), 100) : 0;

  const activeDates = Array.from(
    new Set(
      attempts.map((a) => {
        try {
          const d = new Date(a.completedAt);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        } catch {
          return '';
        }
      }).filter(Boolean)
    )
  );

  // Kira rentak streak hari berturut-turut sebenar berdasarkan kalendar
  const realStreakDays = (() => {
    if (activeDates.length === 0) return 1;

    const dateSet = new Set(activeDates);
    const formatDate = (d: Date) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const now = new Date();
    const todayStr = formatDate(now);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    let streak = 0;
    let checkDate = new Date(now);

    if (dateSet.has(todayStr)) {
      streak = 1;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const prevStr = formatDate(checkDate);
        if (dateSet.has(prevStr)) {
          streak++;
        } else {
          break;
        }
      }
    } else if (dateSet.has(yesterdayStr)) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const prevStr = formatDate(checkDate);
        if (dateSet.has(prevStr)) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      streak = 1;
    }

    return streak;
  })();

  return {
    ...child,
    totalQuizzes: attempts.length,
    passedQuizzes: passedCount,
    averageScore,
    totalAwards: awards.length,
    streakDays: realStreakDays,
    activeDates,
  };
}

export async function claimStudentMission(missionId: string, coinReward: number, childId?: string, email?: string) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) {
    throw new Error('Pelajar tidak ditemui');
  }

  const [child] = await db
    .select({
      id: children.id,
      coins: children.coins,
      claimedMissions: children.claimedMissions,
    })
    .from(children)
    .where(eq(children.id, targetChildId))
    .limit(1);

  if (!child) throw new Error('Pelajar tidak ditemui');

  const currentClaimed = Array.isArray(child.claimedMissions) ? child.claimedMissions : [];
  if (currentClaimed.includes(missionId)) {
    return {
      coins: child.coins,
      claimedMissions: currentClaimed,
    };
  }

  const updatedClaimed = [...currentClaimed, missionId];
  const updatedCoins = (child.coins ?? 200) + coinReward;

  const [updated] = await db
    .update(children)
    .set({
      coins: updatedCoins,
      claimedMissions: updatedClaimed,
    })
    .where(eq(children.id, targetChildId))
    .returning({
      coins: children.coins,
      claimedMissions: children.claimedMissions,
    });

  return updated;
}

export async function completeStudentMission(missionId: string, childId?: string, email?: string) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) return null;

  const [child] = await db
    .select({
      id: children.id,
      completedMissions: children.completedMissions,
    })
    .from(children)
    .where(eq(children.id, targetChildId))
    .limit(1);

  if (!child) return null;

  const current = Array.isArray(child.completedMissions) ? child.completedMissions : [];
  if (!current.includes(missionId)) {
    const updated = [...current, missionId];
    await db
      .update(children)
      .set({ completedMissions: updated })
      .where(eq(children.id, targetChildId));
    return updated;
  }
  return current;
}

export const LEVEL_MILESTONES: Record<number, { level: number; coinReward: number; title: string; rarity: string; unlockedItemName: string }> = {
  2: { level: 2, coinReward: 100, title: 'Penjelajah Angkasa', rarity: 'Rare', unlockedItemName: 'Musang Galaksi & Aura Neon' },
  3: { level: 3, coinReward: 150, title: 'Cendekiawan Muda', rarity: 'Rare', unlockedItemName: 'Astronaut Gold & Api Phoenix' },
  4: { level: 4, coinReward: 200, title: 'Pahlawan Sains & Sifir', rarity: 'Epic', unlockedItemName: 'Mahkota Diraja & Naga Neon' },
  5: { level: 5, coinReward: 250, title: 'Master Kombo Galaksi', rarity: 'Epic', unlockedItemName: 'Mecha Robot Alpha' },
  6: { level: 6, coinReward: 300, title: 'Legenda Kosmik Diraja', rarity: 'Legendary', unlockedItemName: 'Ahli Sains Cosmic' },
  7: { level: 7, coinReward: 350, title: 'Adiwira Bintang Unggul', rarity: 'Legendary', unlockedItemName: 'Item Rahsia Kosmik' },
  8: { level: 8, coinReward: 400, title: 'Grandmaster Exploria', rarity: 'Legendary', unlockedItemName: 'Mahkota Galaksi Tertinggi' },
  9: { level: 9, coinReward: 450, title: 'Raja Ilmu Semesta', rarity: 'Mythic', unlockedItemName: 'Sayap Aurora Mythic' },
  10: { level: 10, coinReward: 500, title: 'Dewa Bintang Abadi', rarity: 'Mythic', unlockedItemName: 'Gelaran Mitos Abadi' },
};

export const AVATAR_MAP: Record<string, string> = {
  av_1: '🧑‍🚀', // Astronaut Cyber Gold
  av_2: '🤖',   // Mecha Robot Alpha
  av_3: '🦊',   // Musang Galaksi Comel
  av_4: '🧙‍♂️',   // Ahli Sains Cosmic
  av_5: '🐉',   // Naga Neon Mythic
  default_boy: '👦',
  default_girl: '👧',
};

export const FRAME_MAP: Record<string, { emoji: string; title: string; style: string }> = {
  fr_1: { emoji: '👑', title: 'Bingkai Mahkota Diraja', style: 'ring-4 ring-amber-400' },
  fr_2: { emoji: '⚡', title: 'Aura Kilat Neon Biru', style: 'ring-4 ring-sky-400' },
  fr_3: { emoji: '🌟', title: 'Lencana Bintang Penjelajah', style: 'ring-4 ring-yellow-400' },
  fr_4: { emoji: '🔥', title: 'Gelombang Api Phoenix', style: 'ring-4 ring-rose-500' },
  fr_5: { emoji: '🌌', title: 'Bingkai Aurora Galaksi Nova', style: 'ring-4 ring-purple-500' },
};

export async function redeemStudentItem(
  itemId: string,
  cost: number,
  requiredLevel: number = 1,
  childId?: string,
  email?: string
) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) {
    throw new Error('Pelajar tidak ditemui');
  }

  const [child] = await db
    .select({
      id: children.id,
      coins: children.coins,
      level: children.level,
      redeemedItems: children.redeemedItems,
      avatarUrl: children.avatarUrl,
    })
    .from(children)
    .where(eq(children.id, targetChildId))
    .limit(1);

  if (!child) throw new Error('Pelajar tidak ditemui');

  const currentCoins = child.coins ?? 200;
  const currentLevel = child.level ?? 1;
  const currentRedeemed = Array.isArray(child.redeemedItems) ? child.redeemedItems : [];

  if (currentRedeemed.includes(itemId)) {
    return {
      success: true,
      coins: currentCoins,
      redeemedItems: currentRedeemed,
      message: 'Item telah pun ditebus',
    };
  }

  if (currentLevel < requiredLevel) {
    throw new Error(`Item ini memerlukan Tahap Level ${requiredLevel} untuk ditebus! Tahap semasa anda adalah Tahap ${currentLevel}.`);
  }

  if (currentCoins < cost) {
    throw new Error('Baki coin tidak mencukupi untuk menebus ganjaran ini');
  }

  const updatedCoins = currentCoins - cost;
  let updatedRedeemed = [...currentRedeemed, itemId];
  let updatedAvatar = child.avatarUrl || '🧑‍🚀';

  // Automatically equip the newly redeemed avatar or frame
  if (itemId.startsWith('av_') && AVATAR_MAP[itemId]) {
    updatedAvatar = AVATAR_MAP[itemId];
    updatedRedeemed = updatedRedeemed.filter((i) => !i.startsWith('equipped_avatar:'));
    updatedRedeemed.push(`equipped_avatar:${itemId}`);
  } else if (itemId.startsWith('fr_')) {
    updatedRedeemed = updatedRedeemed.filter((i) => !i.startsWith('equipped_frame:'));
    updatedRedeemed.push(`equipped_frame:${itemId}`);
  }

  const [updated] = await db
    .update(children)
    .set({
      coins: updatedCoins,
      redeemedItems: updatedRedeemed,
      avatarUrl: updatedAvatar,
    })
    .where(eq(children.id, targetChildId))
    .returning({
      coins: children.coins,
      redeemedItems: children.redeemedItems,
      avatarUrl: children.avatarUrl,
    });

  return {
    success: true,
    coins: updated.coins,
    redeemedItems: updated.redeemedItems,
    avatarUrl: updated.avatarUrl,
  };
}

export async function equipStudentItem(
  itemId: string,
  childId?: string,
  email?: string
) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) throw new Error('Pelajar tidak ditemui');

  const [child] = await db
    .select({
      id: children.id,
      redeemedItems: children.redeemedItems,
      avatarUrl: children.avatarUrl,
    })
    .from(children)
    .where(eq(children.id, targetChildId))
    .limit(1);

  if (!child) throw new Error('Pelajar tidak ditemui');

  const currentRedeemed = Array.isArray(child.redeemedItems) ? child.redeemedItems : [];

  // Allowed if redeemed or default avatar
  const isDefault = itemId === 'default_boy' || itemId === 'default_girl';
  if (!currentRedeemed.includes(itemId) && !isDefault) {
    throw new Error('Item ini belum ditebus! Sila tebus item terlebih dahulu.');
  }

  const isAvatar = itemId.startsWith('av_') || isDefault;
  const isFrame = itemId.startsWith('fr_');

  let updatedAvatar = child.avatarUrl || '🧑‍🚀';
  if (isAvatar && AVATAR_MAP[itemId]) {
    updatedAvatar = AVATAR_MAP[itemId];
  }

  let updatedRedeemed = currentRedeemed.filter((item) => {
    if (isAvatar && item.startsWith('equipped_avatar:')) return false;
    if (isFrame && item.startsWith('equipped_frame:')) return false;
    return true;
  });

  if (isAvatar) {
    updatedRedeemed.push(`equipped_avatar:${itemId}`);
  } else if (isFrame) {
    updatedRedeemed.push(`equipped_frame:${itemId}`);
  }

  const [updated] = await db
    .update(children)
    .set({
      avatarUrl: updatedAvatar,
      redeemedItems: updatedRedeemed,
    })
    .where(eq(children.id, targetChildId))
    .returning({
      avatarUrl: children.avatarUrl,
      redeemedItems: children.redeemedItems,
    });

  const equippedAvatar = updated.redeemedItems.find((i) => i.startsWith('equipped_avatar:'))?.replace('equipped_avatar:', '') || null;
  const equippedFrame = updated.redeemedItems.find((i) => i.startsWith('equipped_frame:'))?.replace('equipped_frame:', '') || null;

  return {
    success: true,
    avatarUrl: updated.avatarUrl,
    redeemedItems: updated.redeemedItems,
    equippedAvatar,
    equippedFrame,
  };
}

export async function claimLevelReward(targetLevel: number, childId?: string, email?: string) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) {
    throw new Error('Pelajar tidak ditemui');
  }

  const [child] = await db
    .select({
      id: children.id,
      coins: children.coins,
      level: children.level,
      claimedLevelRewards: children.claimedLevelRewards,
    })
    .from(children)
    .where(eq(children.id, targetChildId))
    .limit(1);

  if (!child) throw new Error('Pelajar tidak ditemui');

  const currentLevel = child.level || 1;
  if (currentLevel < targetLevel) {
    throw new Error(`Tahap anda (Tahap ${currentLevel}) belum mencapai Tahap ${targetLevel}`);
  }

  const currentClaimed = Array.isArray(child.claimedLevelRewards) ? child.claimedLevelRewards : [];
  if (currentClaimed.includes(targetLevel)) {
    return {
      success: true,
      coins: child.coins,
      claimedLevelRewards: currentClaimed,
      message: `Ganjaran Tahap ${targetLevel} telah pun dituntut`,
    };
  }

  const milestone = LEVEL_MILESTONES[targetLevel] || {
    level: targetLevel,
    coinReward: 100 + (targetLevel - 2) * 50,
    title: `Pejuang Tahap ${targetLevel}`,
    rarity: 'Rare',
    unlockedItemName: 'Item Eksklusif',
  };

  const newCoins = (child.coins || 0) + milestone.coinReward;
  const updatedClaimed = [...currentClaimed, targetLevel];

  const [updated] = await db
    .update(children)
    .set({
      coins: newCoins,
      claimedLevelRewards: updatedClaimed,
    })
    .where(eq(children.id, targetChildId))
    .returning({
      coins: children.coins,
      claimedLevelRewards: children.claimedLevelRewards,
    });

  return {
    success: true,
    coins: updated.coins,
    claimedLevelRewards: updated.claimedLevelRewards,
    rewardClaimed: milestone,
    message: `Tahniah! Anda berjaya menuntut ${milestone.coinReward} Koin bagi Tahap ${targetLevel}!`,
  };
}

export async function claimAllLevelRewards(childId?: string, email?: string) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) {
    throw new Error('Pelajar tidak ditemui');
  }

  const [child] = await db
    .select({
      id: children.id,
      coins: children.coins,
      level: children.level,
      claimedLevelRewards: children.claimedLevelRewards,
    })
    .from(children)
    .where(eq(children.id, targetChildId))
    .limit(1);

  if (!child) throw new Error('Pelajar tidak ditemui');

  const currentLevel = child.level || 1;
  const currentClaimed = Array.isArray(child.claimedLevelRewards) ? child.claimedLevelRewards : [];

  let totalBonus = 0;
  const newClaimedList = [...currentClaimed];
  const claimedMilestones: Array<{ level: number; coinReward: number; title: string }> = [];

  for (const [lvlKey, milestone] of Object.entries(LEVEL_MILESTONES)) {
    const lvlNum = Number(lvlKey);
    if (currentLevel >= lvlNum && !currentClaimed.includes(lvlNum)) {
      totalBonus += milestone.coinReward;
      newClaimedList.push(lvlNum);
      claimedMilestones.push(milestone);
    }
  }

  if (totalBonus === 0) {
    return {
      success: true,
      coins: child.coins ?? 200,
      claimedLevelRewards: currentClaimed,
      totalCoinsClaimed: 0,
      claimedCount: 0,
    };
  }

  const updatedCoins = (child.coins ?? 200) + totalBonus;

  const [updated] = await db
    .update(children)
    .set({
      coins: updatedCoins,
      claimedLevelRewards: newClaimedList,
    })
    .where(eq(children.id, targetChildId))
    .returning({
      coins: children.coins,
      claimedLevelRewards: children.claimedLevelRewards,
    });

  return {
    success: true,
    coins: updated.coins,
    claimedLevelRewards: updated.claimedLevelRewards,
    totalCoinsClaimed: totalBonus,
    claimedCount: claimedMilestones.length,
    claimedMilestones,
  };
}

export async function claimDailyLoginReward(
  dateStr: string,
  coinReward: number,
  childId?: string,
  email?: string
) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) {
    throw new Error('Pelajar tidak ditemui');
  }

  const [child] = await db
    .select({
      id: children.id,
      coins: children.coins,
      claimedMissions: children.claimedMissions,
    })
    .from(children)
    .where(eq(children.id, targetChildId))
    .limit(1);

  if (!child) throw new Error('Pelajar tidak ditemui');

  // Verify that dateStr is today's local date
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (dateStr !== todayStr) {
    throw new Error('Hanya ganjaran log masuk hari ini yang boleh dituntut. Hari yang terlepas tidak boleh dituntut semula.');
  }

  const currentClaimed = Array.isArray(child.claimedMissions) ? child.claimedMissions : [];
  const claimKey = `daily:${dateStr}`;

  if (currentClaimed.includes(claimKey)) {
    return {
      success: true,
      coins: child.coins ?? 200,
      claimedMissions: currentClaimed,
      message: 'Ganjaran hari ini telah pun dituntut',
    };
  }

  const updatedClaimed = [...currentClaimed, claimKey];
  const updatedCoins = (child.coins ?? 200) + coinReward;

  const [updated] = await db
    .update(children)
    .set({
      coins: updatedCoins,
      claimedMissions: updatedClaimed,
    })
    .where(eq(children.id, targetChildId))
    .returning({
      coins: children.coins,
      claimedMissions: children.claimedMissions,
    });

  return {
    success: true,
    coins: updated.coins,
    claimedDate: dateStr,
    coinReward,
    claimedMissions: updated.claimedMissions,
  };
}

export async function awardStudentStudyXp(data: {
  childId?: string;
  email?: string;
  xpAmount?: number;
  topicTitle?: string;
}) {
  const targetChildId = await resolveStudentTargetId(data.childId, data.email);
  if (!targetChildId) {
    throw new Error('Pelajar tidak ditemui');
  }

  const [child] = await db
    .select({
      id: children.id,
      xp: children.xp,
      level: children.level,
      coins: children.coins,
      completedMissions: children.completedMissions,
    })
    .from(children)
    .where(eq(children.id, targetChildId))
    .limit(1);

  if (!child) throw new Error('Pelajar tidak ditemui');

  const earned = data.xpAmount || 40;
  const prevLevel = child.level || 1;
  const newXp = (child.xp || 0) + earned;
  const newLevel = Math.floor(newXp / 250) + 1;
  const leveledUp = newLevel > prevLevel;

  const currentCompleted = Array.isArray(child.completedMissions) ? child.completedMissions : [];
  const updatedCompleted = currentCompleted.includes('m1') ? currentCompleted : [...currentCompleted, 'm1'];

  const [updated] = await db
    .update(children)
    .set({
      xp: newXp,
      level: newLevel,
      completedMissions: updatedCompleted,
    })
    .where(eq(children.id, targetChildId))
    .returning({
      id: children.id,
      xp: children.xp,
      level: children.level,
      coins: children.coins,
    });

  return {
    success: true,
    xpEarned: earned,
    newXp,
    newLevel,
    previousLevel: prevLevel,
    leveledUp,
    coins: updated.coins,
  };
}

export async function getStudentHistory(childId?: string, email?: string) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) return [];

  const attempts = await db
    .select({
      id: quizAttempts.id,
      completedAt: quizAttempts.completedAt,
      score: quizAttempts.score,
      passed: quizAttempts.passed,
      xpEarned: quizAttempts.xpEarned,
      quizTitle: quizzesTournaments.title,
      quizEmoji: quizzesTournaments.emoji,
      subjectTitle: subjects.title,
      category: subjects.category,
    })
    .from(quizAttempts)
    .innerJoin(quizzesTournaments, eq(quizAttempts.quizId, quizzesTournaments.id))
    .innerJoin(subjects, eq(quizzesTournaments.subjectId, subjects.id))
    .where(eq(quizAttempts.childId, targetChildId))
    .orderBy(desc(quizAttempts.completedAt));

  return attempts.map((a) => ({
    id: a.id,
    date: new Date(a.completedAt).toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    completedAt: a.completedAt.toISOString().split('T')[0],
    subject: `${a.subjectTitle} - ${a.quizTitle}`,
    category: a.subjectTitle,
    score: Math.min(Math.round(a.score > 10 ? a.score : (a.score / 10) * 100), 100),
    xp: a.xpEarned,
    passed: a.passed,
    emoji: a.quizEmoji || '📝',
  }));
}

export async function getStudentAchievements(childId?: string, email?: string) {
  const targetChildId = await resolveStudentTargetId(childId, email);
  if (!targetChildId) return { child: null, awards: [], recent: [] };

  const [child] = await db.select().from(children).where(eq(children.id, targetChildId)).limit(1);
  const awards = await db.select().from(rewardsCertificates).where(eq(rewardsCertificates.childId, targetChildId)).orderBy(desc(rewardsCertificates.awardedAt));
  const recentAttempts = await db
    .select({
      title: quizzesTournaments.title,
      score: quizAttempts.score,
    })
    .from(quizAttempts)
    .innerJoin(quizzesTournaments, eq(quizAttempts.quizId, quizzesTournaments.id))
    .where(eq(quizAttempts.childId, targetChildId))
    .orderBy(desc(quizAttempts.completedAt))
    .limit(3);

  return {
    child,
    awards,
    recent: recentAttempts.map((r) => `${r.title} - ${Math.min(Math.round(r.score > 10 ? r.score : (r.score / 10) * 100), 100)}%`),
  };
}

// ─── 6. ADMIN CMS & RECORD MUTATIONS ─────────────────────────────────────────

export async function getAdminMetadata() {
  const subs = await db
    .select({ id: subjects.id, title: subjects.title, category: subjects.category })
    .from(subjects)
    .orderBy(subjects.title);

  const qzs = await db
    .select({
      id: quizzesTournaments.id,
      title: quizzesTournaments.title,
      subjectId: quizzesTournaments.subjectId,
      isTournament: quizzesTournaments.isTournament,
    })
    .from(quizzesTournaments)
    .orderBy(quizzesTournaments.title);

  const prnts = await db
    .select({ id: profiles.id, fullName: profiles.fullName, email: profiles.email })
    .from(profiles)
    .where(eq(profiles.role, 'parent'))
    .orderBy(profiles.fullName);

  const stds = await db
    .select({ id: children.id, fullName: children.fullName, schoolType: children.schoolType, grade: children.grade })
    .from(children)
    .orderBy(children.fullName);

  const [adminUser] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.role, 'admin'))
    .limit(1);

  return {
    subjects: subs,
    quizzes: qzs,
    parents: prnts,
    students: stds,
    adminProfile: adminUser || null,
  };
}

export async function createSubjectRecord(data: {
  title: string;
  description?: string;
  category: 'SK' | 'SMK';
}) {
  const [newSub] = await db
    .insert(subjects)
    .values({
      title: data.title.trim(),
      description: data.description?.trim() || 'Modul Pembelajaran',
      category: data.category,
    })
    .returning();
  return newSub;
}

export async function ensureLessonMaterialsColumns() {
  try {
    await db.execute(sql`ALTER TABLE lessons_materials ADD COLUMN IF NOT EXISTS quiz_id uuid;`);
  } catch {}
  try {
    await db.execute(sql`ALTER TABLE lessons_materials ADD COLUMN IF NOT EXISTS chapter_title text;`);
  } catch {}
  try {
    await db.execute(sql`ALTER TABLE lessons_materials ADD COLUMN IF NOT EXISTS summary text;`);
  } catch {}
  try {
    await db.execute(sql`ALTER TABLE lessons_materials ADD COLUMN IF NOT EXISTS key_points jsonb;`);
  } catch {}
  try {
    await db.execute(sql`ALTER TABLE lessons_materials ADD COLUMN IF NOT EXISTS formula_or_vocabulary jsonb;`);
  } catch {}
  try {
    await db.execute(sql`ALTER TABLE lessons_materials ADD COLUMN IF NOT EXISTS exam_tip text;`);
  } catch {}
  try {
    await db.execute(sql`ALTER TABLE lessons_materials ALTER COLUMN content_url DROP NOT NULL;`);
  } catch {}
}

export async function createLessonMaterialRecord(data: {
  subjectId: string;
  title: string;
  type?: string;
  contentUrl?: string;
  quizId?: string;
  chapterTitle?: string;
  summary?: string;
  keyPoints?: string[];
  formulaOrVocabulary?: string[];
  examTip?: string;
}) {
  await ensureLessonMaterialsColumns();
  const [newMat] = await db
    .insert(lessonsMaterials)
    .values({
      subjectId: data.subjectId,
      quizId: data.quizId || null,
      chapterTitle: data.chapterTitle?.trim() || null,
      title: data.title.trim(),
      type: data.type || 'notes',
      contentUrl: data.contentUrl?.trim() || '',
      summary: data.summary?.trim() || null,
      keyPoints: data.keyPoints || null,
      formulaOrVocabulary: data.formulaOrVocabulary || null,
      examTip: data.examTip?.trim() || null,
    })
    .returning();
  return newMat;
}

export async function createQuestionRecord(data: {
  quizId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}) {
  const [newQ] = await db
    .insert(questions)
    .values({
      quizId: data.quizId,
      questionText: data.questionText.trim(),
      options: data.options.map((o) => o.trim()),
      correctAnswer: data.correctAnswer.trim(),
    })
    .returning();
  return newQ;
}

export async function createCompetitionRecord(data: {
  title: string;
  subjectId: string;
  description?: string;
  emoji?: string;
  difficulty?: string;
  durationMinutes?: number;
  startTime?: Date | null;
  endTime?: Date | null;
  isActive?: boolean;
}) {
  const [newComp] = await db
    .insert(quizzesTournaments)
    .values({
      title: data.title.trim(),
      subjectId: data.subjectId,
      description: data.description?.trim() || 'Pertandingan Rasmi Exploria',
      emoji: data.emoji || '🏆',
      difficulty: data.difficulty || 'SEDERHANA',
      durationMinutes: Number(data.durationMinutes) || 15,
      isTournament: true,
      startTime: data.startTime || new Date(),
      endTime: data.endTime || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: data.isActive ?? true,
    })
    .returning();
  return newComp;
}

export async function createParentRecord(data: {
  fullName: string;
  email: string;
  phone?: string;
  icNumber?: string;
  isApproved?: boolean;
}) {
  const generatedId = crypto.randomUUID();
  const [newParent] = await db
    .insert(profiles)
    .values({
      id: generatedId,
      fullName: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || '012-3456789',
      icNumber: data.icNumber?.trim() || '880101-14-1234',
      role: 'parent',
      isApproved: data.isApproved ?? true,
    })
    .returning();
  return newParent;
}

export async function createStudentAdminRecord(data: {
  parentId: string;
  fullName: string;
  icNumber?: string;
  schoolType: 'SK' | 'SMK';
  grade: string;
  schoolName?: string;
  gender?: string;
  email?: string;
}) {
  const [newStudent] = await db
    .insert(children)
    .values({
      parentId: data.parentId,
      fullName: data.fullName.trim(),
      icNumber: data.icNumber ? data.icNumber.trim() : null,
      schoolType: data.schoolType,
      grade: data.grade.trim(),
      schoolName: data.schoolName?.trim() || null,
      gender: data.gender || 'Lelaki',
      email: data.email ? data.email.toLowerCase().trim() : null,
      avatarUrl: data.gender === 'Perempuan' ? '👧' : '👦',
      xp: 0,
      level: 1,
    })
    .returning();
  return newStudent;
}

export async function createAwardRecord(data: {
  childId: string;
  type: 'badge' | 'medal_bronze' | 'medal_silver' | 'medal_gold' | 'certificate';
  title: string;
  description?: string;
  score?: number;
  competitionTitle?: string;
}) {
  const certId = `EXP-CERT-${Date.now().toString().slice(-6)}`;
  const [newAward] = await db
    .insert(rewardsCertificates)
    .values({
      childId: data.childId,
      type: data.type,
      title: data.title.trim(),
      description: data.description?.trim() || 'Pencapaian cemerlang dalam modul Exploria',
      certId,
      score: data.score ?? 100,
      competitionTitle: data.competitionTitle?.trim() || 'Anugerah Tahunan Exploria',
    })
    .returning();
  return newAward;
}

export async function createAnnouncementRecord(data: {
  title: string;
  content: string;
  category?: string;
  targetAudience?: string;
  isActive?: boolean;
}) {
  const [newAnn] = await db
    .insert(announcements)
    .values({
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category?.trim() || 'Umum',
      targetAudience: data.targetAudience?.trim() || 'Semua',
      isActive: data.isActive ?? true,
    })
    .returning();
  return newAnn;
}

export async function deleteAdminRecord(section: string, id: string) {
  if (section === 'subjects') {
    const relatedQuizzes = await db
      .select({ id: quizzesTournaments.id })
      .from(quizzesTournaments)
      .where(eq(quizzesTournaments.subjectId, id));
    for (const q of relatedQuizzes) {
      await db.delete(quizAttempts).where(eq(quizAttempts.quizId, q.id)).catch(() => {});
      await db.delete(questions).where(eq(questions.quizId, q.id)).catch(() => {});
    }
    await db.delete(quizzesTournaments).where(eq(quizzesTournaments.subjectId, id)).catch(() => {});
    await db.delete(lessonsMaterials).where(eq(lessonsMaterials.subjectId, id)).catch(() => {});
    return await db.delete(subjects).where(eq(subjects.id, id)).returning();
  }
  if (section === 'materials') {
    return await db.delete(lessonsMaterials).where(eq(lessonsMaterials.id, id)).returning();
  }
  if (section === 'questions') {
    return await db.delete(questions).where(eq(questions.id, id)).returning();
  }
  if (section === 'competitions') {
    await db.delete(quizAttempts).where(eq(quizAttempts.quizId, id)).catch(() => {});
    await db.delete(questions).where(eq(questions.quizId, id)).catch(() => {});
    return await db.delete(quizzesTournaments).where(eq(quizzesTournaments.id, id)).returning();
  }
  if (section === 'parents') {
    const parentChildren = await db
      .select({ id: children.id })
      .from(children)
      .where(eq(children.parentId, id));
    for (const c of parentChildren) {
      await db.delete(quizAttempts).where(eq(quizAttempts.childId, c.id)).catch(() => {});
      await db.delete(rewardsCertificates).where(eq(rewardsCertificates.childId, c.id)).catch(() => {});
    }
    await db.delete(children).where(eq(children.parentId, id)).catch(() => {});
    return await db.delete(profiles).where(eq(profiles.id, id)).returning();
  }
  if (section === 'students') {
    await db.delete(quizAttempts).where(eq(quizAttempts.childId, id)).catch(() => {});
    await db.delete(rewardsCertificates).where(eq(rewardsCertificates.childId, id)).catch(() => {});
    return await db.delete(children).where(eq(children.id, id)).returning();
  }
  if (section === 'awards') {
    return await db.delete(rewardsCertificates).where(eq(rewardsCertificates.id, id)).returning();
  }
  if (section === 'orders') {
    return await db.delete(physicalOrders).where(eq(physicalOrders.id, id)).returning();
  }
  if (section === 'announcements') {
    return await db.delete(announcements).where(eq(announcements.id, id)).returning();
  }
  throw new Error(`Kategori ${section} tidak sah untuk pemadaman.`);
}

export async function updateAdminRecord(section: string, id: string, data: Record<string, any>) {
  if (section === 'subjects') {
    return await db
      .update(subjects)
      .set({
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || '' } : {}),
        ...(data.category ? { category: data.category } : {}),
      })
      .where(eq(subjects.id, id))
      .returning();
  }
  if (section === 'materials') {
    await ensureLessonMaterialsColumns();
    return await db
      .update(lessonsMaterials)
      .set({
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.contentUrl !== undefined ? { contentUrl: data.contentUrl.trim() } : {}),
        ...(data.subjectId ? { subjectId: data.subjectId } : {}),
        ...(data.quizId !== undefined ? { quizId: data.quizId || null } : {}),
        ...(data.chapterTitle !== undefined ? { chapterTitle: data.chapterTitle.trim() } : {}),
        ...(data.summary !== undefined ? { summary: data.summary.trim() } : {}),
        ...(data.keyPoints !== undefined ? { keyPoints: data.keyPoints } : {}),
        ...(data.formulaOrVocabulary !== undefined ? { formulaOrVocabulary: data.formulaOrVocabulary } : {}),
        ...(data.examTip !== undefined ? { examTip: data.examTip.trim() } : {}),
      })
      .where(eq(lessonsMaterials.id, id))
      .returning();
  }
  if (section === 'questions') {
    return await db
      .update(questions)
      .set({
        ...(data.questionText ? { questionText: data.questionText.trim() } : {}),
        ...(data.options ? { options: data.options } : {}),
        ...(data.correctAnswer ? { correctAnswer: data.correctAnswer.trim() } : {}),
        ...(data.quizId ? { quizId: data.quizId } : {}),
      })
      .where(eq(questions.id, id))
      .returning();
  }
  if (section === 'competitions') {
    await ensureCompetitionColumns();
    const updatePayload: Record<string, any> = {
      ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
      ...(data.title ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || '' } : {}),
      ...(data.difficulty ? { difficulty: data.difficulty } : {}),
      ...(data.emoji ? { emoji: data.emoji } : {}),
      ...(data.durationMinutes !== undefined ? { durationMinutes: Number(data.durationMinutes) || 10 } : {}),
      ...(data.subjectId ? { subjectId: data.subjectId } : {}),
    };

    // Apabila admin mengaktifkan semula pertandingan atau reset percubaan, perbaharui kitaran peperiksaan
    if (data.isActive === true || data.resetAttempts === true) {
      updatePayload.lastOpenedAt = new Date();
    }

    return await db
      .update(quizzesTournaments)
      .set(updatePayload)
      .where(eq(quizzesTournaments.id, id))
      .returning();
  }
  if (section === 'parents') {
    return await db
      .update(profiles)
      .set({
        ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
        ...(data.email ? { email: data.email.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
        ...(data.icNumber !== undefined ? { icNumber: data.icNumber?.trim() || null } : {}),
        ...(data.isApproved !== undefined ? { isApproved: Boolean(data.isApproved) } : {}),
      })
      .where(eq(profiles.id, id))
      .returning();
  }
  if (section === 'students') {
    return await db
      .update(children)
      .set({
        ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
        ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
        ...(data.icNumber !== undefined ? { icNumber: data.icNumber?.trim() || null } : {}),
        ...(data.schoolType ? { schoolType: data.schoolType } : {}),
        ...(data.grade ? { grade: data.grade.trim() } : {}),
        ...(data.schoolName !== undefined ? { schoolName: data.schoolName?.trim() || null } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        ...(data.parentId ? { parentId: data.parentId } : {}),
      })
      .where(eq(children.id, id))
      .returning();
  }
  if (section === 'awards') {
    return await db
      .update(rewardsCertificates)
      .set({
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || '' } : {}),
        ...(data.score !== undefined ? { score: Number(data.score) } : {}),
        ...(data.childId ? { childId: data.childId } : {}),
        ...(data.competitionTitle !== undefined ? { competitionTitle: data.competitionTitle?.trim() || '' } : {}),
      })
      .where(eq(rewardsCertificates.id, id))
      .returning();
  }
  if (section === 'announcements') {
    return await db
      .update(announcements)
      .set({
        ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.content ? { content: data.content.trim() } : {}),
        ...(data.category ? { category: data.category.trim() } : {}),
        ...(data.targetAudience ? { targetAudience: data.targetAudience.trim() } : {}),
      })
      .where(eq(announcements.id, id))
      .returning();
  }
  if (section === 'settings') {
    return await db
      .update(profiles)
      .set({
        ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
        ...(data.email ? { email: data.email.trim() } : {}),
        ...(data.phone ? { phone: data.phone.trim() } : {}),
      })
      .where(eq(profiles.id, id))
      .returning();
  }
  if (section === 'orders') {
    return await db
      .update(physicalOrders)
      .set({
        ...(data.status ? { status: data.status } : {}),
        ...(data.trackingNumber !== undefined ? { trackingNumber: data.trackingNumber?.trim() || null } : {}),
      })
      .where(eq(physicalOrders.id, id))
      .returning();
  }
  throw new Error(`Kategori ${section} tidak sah untuk kemaskini.`);
}

// ─── 7. PHYSICAL AWARDS & ORDERS MANAGEMENT ─────────────────────────────────
export async function ensurePhysicalOrdersTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS physical_orders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number text NOT NULL,
        parent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
        child_id uuid REFERENCES children(id) ON DELETE SET NULL,
        award_id uuid REFERENCES rewards_certificates(id) ON DELETE SET NULL,
        guardian_name text NOT NULL,
        phone text NOT NULL,
        delivery_address text NOT NULL,
        product_type text NOT NULL,
        product_name text NOT NULL,
        award_title text,
        child_name text,
        total_amount integer NOT NULL,
        payment_method text DEFAULT 'fpx',
        status text DEFAULT 'Baru' NOT NULL,
        tracking_number text,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
  } catch (err) {
    console.error('Failed to ensure physical_orders table', err);
  }
}

export async function createPhysicalOrder(data: {
  parentId?: string;
  childId?: string;
  awardId?: string;
  guardianName: string;
  phone: string;
  deliveryAddress: string;
  productType: string;
  productName: string;
  awardTitle?: string;
  childName?: string;
  totalAmount: number;
  paymentMethod?: string;
}) {
  await ensurePhysicalOrdersTable();
  const orderNumber = `EXP-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const [newOrder] = await db
    .insert(physicalOrders)
    .values({
      orderNumber,
      parentId: data.parentId || null,
      childId: data.childId || null,
      awardId: data.awardId || null,
      guardianName: data.guardianName.trim(),
      phone: data.phone.trim(),
      deliveryAddress: data.deliveryAddress.trim(),
      productType: data.productType,
      productName: data.productName,
      awardTitle: data.awardTitle || 'Pertandingan Exploria',
      childName: data.childName || 'Pelajar',
      totalAmount: Math.round(data.totalAmount),
      paymentMethod: data.paymentMethod || 'fpx',
      status: 'Baru',
    })
    .returning();
  return newOrder;
}

export async function getPhysicalOrders(parentId?: string) {
  await ensurePhysicalOrdersTable();
  if (parentId) {
    return await db
      .select()
      .from(physicalOrders)
      .where(eq(physicalOrders.parentId, parentId))
      .orderBy(desc(physicalOrders.createdAt));
  }
  return [];
}

// ─── 8. SUBJECT DETAILS & CHAPTER SEGREGATION ───────────────────────────────
export async function getSubjectDetailsWithChapters(subjectId: string) {
  await ensureLessonMaterialsColumns();
  const [subject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.id, subjectId))
    .limit(1);

  if (!subject) return null;

  const materials = await db
    .select()
    .from(lessonsMaterials)
    .where(eq(lessonsMaterials.subjectId, subjectId))
    .orderBy(desc(lessonsMaterials.createdAt));

  const quizzes = await db
    .select()
    .from(quizzesTournaments)
    .where(eq(quizzesTournaments.subjectId, subjectId))
    .orderBy(desc(quizzesTournaments.createdAt));

  const chapterMap: Record<string, {
    chapterTitle: string;
    materials: typeof materials;
    quizzes: typeof quizzes;
  }> = {};

  for (const m of materials) {
    const rawChapter = (m.chapterTitle || '').trim();
    const chName = rawChapter || '📂 Rujukan Am (Tanpa Bab Khusus)';
    if (!chapterMap[chName]) {
      chapterMap[chName] = { chapterTitle: chName, materials: [], quizzes: [] };
    }
    chapterMap[chName].materials.push(m);
  }

  for (const q of quizzes) {
    let matchedChapter: string | null = null;
    for (const chName of Object.keys(chapterMap)) {
      if (
        chName !== '📂 Rujukan Am (Tanpa Bab Khusus)' &&
        (q.title.toLowerCase().includes(chName.toLowerCase()) || chName.toLowerCase().includes(q.title.toLowerCase()))
      ) {
        matchedChapter = chName;
        break;
      }
    }
    const target = matchedChapter || '📂 Rujukan Am (Tanpa Bab Khusus)';
    if (!chapterMap[target]) {
      chapterMap[target] = { chapterTitle: target, materials: [], quizzes: [] };
    }
    chapterMap[target].quizzes.push(q);
  }

  const chapters = Object.values(chapterMap);

  return {
    subject,
    materials,
    quizzes,
    chapters,
  };
}

// ─── 9. COMPETITION DETAILS & QUESTIONS MANAGEMENT ──────────────────────────
export async function getCompetitionDetailsWithQuestions(competitionId: string) {
  await ensureCompetitionColumns();
  const [competition] = await db
    .select()
    .from(quizzesTournaments)
    .where(eq(quizzesTournaments.id, competitionId))
    .limit(1);

  if (!competition) return null;

  const [subject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.id, competition.subjectId))
    .limit(1);

  const questionList = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, competitionId))
    .orderBy(questions.createdAt);

  const allSubjects = await db
    .select({ id: subjects.id, title: subjects.title, category: subjects.category })
    .from(subjects)
    .orderBy(subjects.title);

  const [attemptsCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, competitionId));

  return {
    competition,
    subject: subject || null,
    questions: questionList,
    subjects: allSubjects,
    attemptsCount: attemptsCount?.count || 0,
  };
}


// ─── 10. SCHOOLS QUERIES ──────────────────────────────────────────────────────
export async function getSchoolsList(typeFilter?: string) {
  try {
    let query = db.select().from(schools);
    if (typeFilter && typeFilter !== 'ALL') {
      return await query.where(eq(schools.type, typeFilter)).orderBy(schools.name);
    }
    return await query.orderBy(schools.name);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return [];
  }
}

export async function createSchoolRecord(data: {
  name: string;
  type: string;
  code?: string;
  state?: string;
  aliases?: string[];
}) {
  const [created] = await db
    .insert(schools)
    .values({
      name: data.name.trim(),
      type: data.type.trim().toUpperCase(),
      code: data.code?.trim() || null,
      state: data.state?.trim() || 'W.P. Kuala Lumpur',
      aliases: data.aliases || [data.name.trim()],
    })
    .returning();
  return created;
}


