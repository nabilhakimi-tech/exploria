import { NextResponse } from 'next/server';
import {
  getStudentProfile,
  claimStudentMission,
  redeemStudentItem,
  equipStudentItem,
  completeStudentMission,
  claimLevelReward,
  claimAllLevelRewards,
  claimDailyLoginReward,
  awardStudentStudyXp,
  LEVEL_MILESTONES,
} from '@/db/queries';
import { createSupabaseServer } from '@/lib/supabase/server';
import { db } from '@/db';
import { quizAttempts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId') || undefined;

    let userEmail: string | undefined;
    try {
      const supabase = await createSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) userEmail = user.email;
    } catch {}

    const profile = await getStudentProfile(childId, userEmail);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profil pelajar tidak ditemui' },
        { status: 404 }
      );
    }

    // Query real attempts to dynamically determine missions completed
    const attempts = await db
      .select({
        score: quizAttempts.score,
        xpEarned: quizAttempts.xpEarned,
        quizId: quizAttempts.quizId,
      })
      .from(quizAttempts)
      .where(eq(quizAttempts.childId, profile.id));

    const explicitCompleted: string[] = Array.isArray(profile.completedMissions) ? profile.completedMissions : [];
    const completedSet = new Set<string>(explicitCompleted);

    // m1: Ulangkaji nota subjek - if explicitly clicked 'Baca Nota' or has reviewed notes
    if (explicitCompleted.includes('m1') || attempts.length > 0) {
      completedSet.add('m1');
    }

    // m2: Main game arena - if explicitly completed Game Arena
    if (explicitCompleted.includes('m2')) {
      completedSet.add('m2');
    }

    // m3: Skor Peperiksaan 80%+ - from actual attempts
    if (
      attempts.some((a) => (a.score > 10 ? a.score : (a.score / 10) * 100) >= 80) ||
      explicitCompleted.includes('m3')
    ) {
      completedSet.add('m3');
    }

    // m4: Rentak Streak 3 hari - strictly from actual streak of 3 consecutive days
    if ((profile.streakDays ?? 0) >= 3) {
      completedSet.add('m4');
    }

    // m5: Juara Sempurna 100% - from actual attempts
    if (
      attempts.some((a) => (a.score > 10 ? a.score : (a.score / 10) * 100) >= 100) ||
      explicitCompleted.includes('m5')
    ) {
      completedSet.add('m5');
    }

    const rawRedeemed: string[] = profile.redeemedItems ?? [];
    const equippedAvatar = rawRedeemed.find((i) => i.startsWith('equipped_avatar:'))?.replace('equipped_avatar:', '') || null;
    const equippedFrame = rawRedeemed.find((i) => i.startsWith('equipped_frame:'))?.replace('equipped_frame:', '') || null;
    const cleanRedeemed = rawRedeemed.filter((i) => !i.startsWith('equipped_'));

    const rawClaimed: string[] = profile.claimedMissions ?? [];
    const claimedDailyDates = rawClaimed
      .filter((m) => m.startsWith('daily:'))
      .map((m) => m.replace('daily:', ''));

    return NextResponse.json({
      success: true,
      data: {
        studentId: profile.id,
        studentName: profile.fullName,
        avatarUrl: profile.avatarUrl || '🧑‍🚀',
        equippedAvatar,
        equippedFrame,
        coins: profile.coins ?? 200,
        xp: profile.xp ?? 0,
        level: profile.level ?? 1,
        completedMissions: Array.from(completedSet),
        claimedMissions: profile.claimedMissions ?? [],
        claimedDailyDates,
        redeemedItems: cleanRedeemed,
        claimedLevelRewards: profile.claimedLevelRewards ?? [],
        levelMilestones: LEVEL_MILESTONES,
      },
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
    const { action, missionId, coinReward, itemId, cost, requiredLevel, targetLevel, childId, xpAmount, topicTitle } = body;

    let userEmail: string | undefined;
    try {
      const supabase = await createSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) userEmail = user.email;
    } catch {}

    // 1. Complete Mission Action
    if (action === 'complete_mission') {
      if (!missionId) {
        return NextResponse.json(
          { success: false, error: 'ID misi diperlukan' },
          { status: 400 }
        );
      }
      const updated = await completeStudentMission(missionId, childId, userEmail);
      return NextResponse.json({ success: true, data: updated });
    }

    // 2. Claim Mission Action (strictly only allowed if completed!)
    if (action === 'claim_mission') {
      if (!missionId || typeof coinReward !== 'number') {
        return NextResponse.json(
          { success: false, error: 'ID misi dan jumlah coin diperlukan' },
          { status: 400 }
        );
      }

      const profile = await getStudentProfile(childId, userEmail);
      if (!profile) {
        return NextResponse.json(
          { success: false, error: 'Pelajar tidak ditemui' },
          { status: 404 }
        );
      }

      // Check real completion
      const attempts = await db
        .select({ score: quizAttempts.score })
        .from(quizAttempts)
        .where(eq(quizAttempts.childId, profile.id));

      const explicitCompleted: string[] = Array.isArray(profile.completedMissions) ? profile.completedMissions : [];
      let isCompleted = explicitCompleted.includes(missionId);

      if (missionId === 'm1' && attempts.length > 0) isCompleted = true;
      if (missionId === 'm3' && attempts.some((a) => (a.score > 10 ? a.score : (a.score / 10) * 100) >= 80)) isCompleted = true;
      if (missionId === 'm4') isCompleted = (profile.streakDays ?? 0) >= 3;
      if (missionId === 'm5' && attempts.some((a) => (a.score > 10 ? a.score : (a.score / 10) * 100) >= 100)) isCompleted = true;

      if (!isCompleted) {
        return NextResponse.json(
          { success: false, error: 'Misi ini belum diselesaikan! Selesaikan misi terlebih dahulu sebelum menuntut coin.' },
          { status: 400 }
        );
      }

      const result = await claimStudentMission(missionId, coinReward, childId, userEmail);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 3. Redeem Item Action (validates coin cost AND required level!)
    if (action === 'redeem_item') {
      if (!itemId || typeof cost !== 'number') {
        return NextResponse.json(
          { success: false, error: 'ID item dan harga coin diperlukan' },
          { status: 400 }
        );
      }

      const reqLevel = typeof requiredLevel === 'number' ? requiredLevel : 1;
      const result = await redeemStudentItem(itemId, cost, reqLevel, childId, userEmail);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 4. Equip Item Action (Allows student to switch avatar or frame anytime to their preference)
    if (action === 'equip_item') {
      if (!itemId) {
        return NextResponse.json(
          { success: false, error: 'ID item diperlukan untuk dipakai' },
          { status: 400 }
        );
      }

      const result = await equipStudentItem(itemId, childId, userEmail);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 5. Claim Level Reward Action (awards bonus coins when reaching level milestones)
    if (action === 'claim_level_reward') {
      if (typeof targetLevel !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Tahap sasaran (targetLevel) diperlukan' },
          { status: 400 }
        );
      }

      const result = await claimLevelReward(targetLevel, childId, userEmail);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 6. Claim All Level Rewards (One-click claim for all unlocked level milestone coins)
    if (action === 'claim_all_level_rewards') {
      const result = await claimAllLevelRewards(childId, userEmail);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 7. Claim Daily Login Streak Reward
    if (action === 'claim_daily_login') {
      const { dateStr, coinReward: dayCoin } = body;
      if (!dateStr) {
        return NextResponse.json(
          { success: false, error: 'Tarikh log masuk diperlukan' },
          { status: 400 }
        );
      }

      const result = await claimDailyLoginReward(
        dateStr,
        typeof dayCoin === 'number' ? dayCoin : 15,
        childId,
        userEmail
      );
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 8. Award Learning/Study Notes XP Action
    if (action === 'study_material') {
      const result = await awardStudentStudyXp({
        childId,
        email: userEmail,
        xpAmount: typeof xpAmount === 'number' ? xpAmount : 40,
        topicTitle,
      });
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Tindakan (action) tidak sah' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
