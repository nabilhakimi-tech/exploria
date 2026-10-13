'use client';

import { useState, useEffect } from 'react';

export type ParentChild = {
  id: string;
  name: string;
  email?: string;
  icNumber?: string;
  age: number;
  school?: string;
  schoolName?: string;
  grade: string;
  gender: string;
  avatar: string;
  image?: string;
  color: string;
};

export function useParentChildren() {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch('/api/parent/children');
        const json = await res.json();
        if (json.success) {
          const mapped = json.data.map(
            (child: {
              id: string;
              fullName: string;
              email?: string;
              icNumber?: string;
              schoolName?: string;
              grade: string;
              gender: string;
              avatarUrl: string;
              color: string;
            }) => ({
              id: child.id,
              name: child.fullName,
              email: child.email,
              icNumber: child.icNumber,
              age: 10, // Default age as it's not in DB
              school: child.schoolName || '',
              schoolName: child.schoolName || '',
              grade: child.grade,
              gender: child.gender,
              avatar: child.avatarUrl,
              color: child.color,
            })
          );
          setChildren(mapped);
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError('Gagal memuatkan profil anak.');
      } finally {
        setLoading(false);
      }
    }
    fetchChildren();
  }, []);

  const refetch = () => {
    setLoading(true);
    fetch('/api/parent/children')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const mapped = json.data.map(
            (child: {
              id: string;
              fullName: string;
              email?: string;
              icNumber?: string;
              schoolName?: string;
              grade: string;
              gender: string;
              avatarUrl: string;
              color: string;
            }) => ({
              id: child.id,
              name: child.fullName,
              email: child.email,
              icNumber: child.icNumber,
              age: 10,
              school: child.schoolName || '',
              grade: child.grade,
              gender: child.gender,
              avatar: child.avatarUrl,
              color: child.color,
            })
          );
          setChildren(mapped);
        }
      })
      .catch(() => setError('Gagal memuatkan profil anak.'))
      .finally(() => setLoading(false));
  };

  return { children, error, loading, refetch };
}

export async function saveParentChild(child: {
  name: string;
  email?: string;
  icNumber?: string;
  password?: string;
  schoolType?: 'SK' | 'SMK';
  schoolName?: string;
  school?: string;
  grade: string;
  gender?: string;
  avatar?: string;
  color?: string;
  image?: string;
}) {
  const res = await fetch('/api/parent/children', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: child.name,
      email: child.email,
      icNumber: child.icNumber,
      password: child.password,
      schoolType: child.schoolType || 'SK',
      schoolName: child.schoolName || child.school || '',
      grade: child.grade,
      gender: child.gender,
      color: child.color,
      avatarUrl: child.image || child.avatar,
    }),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Gagal menyimpan profil anak.');
  }
  return json.data;
}

export async function updateParentChild(
  id: string,
  child: {
    name?: string;
    email?: string;
    icNumber?: string;
    schoolType?: 'SK' | 'SMK';
    schoolName?: string;
    school?: string;
    grade?: string;
    gender?: string;
    avatar?: string;
    color?: string;
    image?: string;
  }
) {
  const res = await fetch('/api/parent/children', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      fullName: child.name,
      email: child.email,
      icNumber: child.icNumber,
      schoolType: child.schoolType,
      schoolName: child.schoolName || child.school,
      grade: child.grade,
      gender: child.gender,
      color: child.color,
      avatarUrl: child.image || child.avatar,
    }),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Gagal mengemaskini profil anak.');
  }
  return json.data;
}

export async function deleteParentChild(id: string) {
  const res = await fetch(`/api/parent/children?id=${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Gagal memadam profil anak.');
  }
  return json.data;
}

export type QuizActivity = {
  id: string;
  childId: string;
  childName: string;
  quizId: string;
  quizTitle: string;
  title: string;
  score: number;
  total: number;
  passed: boolean;
  xpEarned: number;
  completedAt: string;
  time: string;
  daysAgo: number;
  minutes: number;
};

export function useQuizActivities(childId?: string) {
  const [activities, setActivities] = useState<QuizActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const url = childId ? `/api/parent/activity?childId=${childId}` : '/api/parent/activity';
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          const mapped = json.data.map((act: { id: string; childId: string; childName: string; quizId: string; quizTitle: string; score: number; passed: boolean; xpEarned: number; completedAt: string }) => {
            const completedDate = new Date(act.completedAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - completedDate.getTime());
            const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            const rawScore = Number(act.score) || 0;
            const total = rawScore > 10 ? 100 : 10;
            const normalizedScore = Math.min(rawScore, total);
            
            return {
              id: act.id,
              childId: act.childId,
              childName: act.childName,
              quizId: act.quizId,
              quizTitle: act.quizTitle,
              title: act.quizTitle,
              score: normalizedScore,
              total,
              passed: act.passed,
              xpEarned: act.xpEarned,
              completedAt: act.completedAt,
              time: completedDate.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
              daysAgo,
              minutes: 10,
            };
          });
          setActivities(mapped);
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError('Gagal memuatkan aktiviti.');
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, [childId]);

  return { activities, error, loading };
}

export type ChildAward = {
  id: string;
  childId: string;
  childName: string;
  title: string;
  description: string;
  type: string;
  icon: string;
  background: string;
  date: string;
  certId?: string;
  score?: number;
  rank?: string;
  rawTitle?: string;
};

export function useChildAwards(childId?: string) {
  const [awards, setAwards] = useState<ChildAward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAwards() {
      try {
        const url = childId ? `/api/parent/awards?childId=${childId}` : '/api/parent/awards';
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          const mapped = json.data.map((award: { id: string; childId: string; childName: string; title: string; description: string; type: string; awardedAt: string; certId: string; score: number; competitionTitle: string }) => {
            let icon = '🏅';
            let bg = '#fde3d3';
            let rank = 'PENYERTAAN';
            
            if (award.type === 'medal_gold') { icon = '🏆'; bg = '#d9efe0'; rank = 'EMAS'; }
            if (award.type === 'medal_silver') { icon = '🥈'; bg = '#e2e8f0'; rank = 'PERAK'; }
            if (award.type === 'medal_bronze') { icon = '🥉'; bg = '#f3e8ff'; rank = 'GANGSA'; }

            return {
              id: award.id,
              childId: award.childId,
              childName: award.childName,
              title: award.title,
              description: award.description,
              type: award.type,
              icon,
              background: bg,
              date: new Date(award.awardedAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }),
              certId: award.certId,
              score: award.score,
              rank,
              rawTitle: award.competitionTitle || award.title,
            };
          });
          setAwards(mapped);
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError('Gagal memuatkan anugerah.');
      } finally {
        setLoading(false);
      }
    }
    fetchAwards();
  }, [childId]);

  return { awards, error, loading };
}
