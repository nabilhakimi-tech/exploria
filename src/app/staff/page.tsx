'use client';

import Link from 'next/link';
import {
  ArrowDownToLine,
  CalendarDays,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const quizActivity = [120, 180, 150, 260, 210, 330, 290];
const newStudents = [4, 7, 5, 11, 9, 14, 12];
const weekDays = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
const engagement = [55, 48, 36, 62, 30, 70, 52];

function ReportChart() {
  const points = quizActivity.map((value, index) => ({
    x: 14 + index * 58.67,
    y: 112 - (value / 350) * 96,
  }));
  const line = points
    .map((point, index) =>
      index === 0
        ? `M ${point.x},${point.y}`
        : `Q ${(points[index - 1].x + point.x) / 2},${points[index - 1].y} ${point.x},${point.y}`,
    )
    .join(' ');

  return (
    <div className="staff-report-chart">
      <div aria-hidden="true" className="staff-report-tooltip">
        <strong>28 Sep 2026</strong>
        <span><i /> Kuiz dijawab: 260</span>
        <span><b>🏅</b> Pelajar baharu: {newStudents[3]}</span>
      </div>
      <svg
        aria-label="Grafik kuiz dijawab dan pelajar baharu, 25 September hingga 1 Oktober"
        className="staff-report-svg"
        role="img"
        viewBox="0 0 380 124"
      >
        <defs>
          <pattern
            height="7"
            id="report-hatch"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
            width="7"
          >
            <line stroke="rgba(255,255,255,.55)" strokeWidth="1.5" x1="0" x2="0" y1="0" y2="7" />
          </pattern>
        </defs>
        <path d={`${line} L 366,120 L 14,120 Z`} fill="url(#report-hatch)" />
        <path
          d={line}
          fill="none"
          stroke="rgba(255,255,255,.9)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        {points.map((point, index) => (
          <circle
            cx={point.x}
            cy={point.y}
            fill="#fff"
            key={weekDays[index]}
            r={index === 3 ? 4.7 : 2.6}
          />
        ))}
      </svg>
      <div aria-hidden="true" className="staff-report-days">
        {['25 Sep', '26 Sep', '27 Sep', '28 Sep', '29 Sep', '30 Sep', '1 Okt'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}

function WeeklyChart() {
  const current = [90, 140, 120, 210, 260, 330, 340];
  const previous = [60, 90, 110, 150, 170, 200, 230];
  const getPoints = (values: number[]) =>
    values.map((value, index) => ({
      x: 40 + index * 37,
      y: 122 - (value / 400) * 108,
    }));
  const currentPoints = getPoints(current);
  const previousPoints = getPoints(previous);
  const getPath = (points: { x: number; y: number }[]) =>
    points
      .map((point, index) =>
        index === 0
          ? `M ${point.x},${point.y}`
          : `Q ${(points[index - 1].x + point.x) / 2},${points[index - 1].y} ${point.x},${point.y}`,
      )
      .join(' ');

  return (
    <svg
      aria-label="Grafik ringkasan kuiz mingguan"
      className="staff-weekly-svg"
      role="img"
      viewBox="0 0 280 150"
    >
      {[0, 100, 200, 300, 400].map((value) => (
        <text fill="#96a0ae" fontSize="8" key={value} x="0" y={125 - (value / 400) * 108}>
          {value}
        </text>
      ))}
      {weekDays.map((day, index) => (
        <text
          fill="#8993a2"
          fontSize="8"
          key={day}
          textAnchor="middle"
          x={40 + index * 37}
          y="144"
        >
          {day}
        </text>
      ))}
      <path
        d={getPath(previousPoints)}
        fill="none"
        stroke="#909baa"
        strokeDasharray="3 3"
        strokeWidth="1.7"
      />
      <path
        d={getPath(currentPoints)}
        fill="none"
        stroke="#f22472"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle cx={currentPoints[6].x} cy={currentPoints[6].y} fill="#f22472" r="3.5" />
      <circle cx={previousPoints[6].x} cy={previousPoints[6].y} fill="#909baa" r="3.5" />
    </svg>
  );
}

function StudentHexagons() {
  const colors = ['#00a99e', '#f29200', '#e0246a'];
  const hexagons: { points: string; color: string; opacity: number }[] = [];
  const radius = 11;

  for (let column = -3; column <= 3; column += 1) {
    for (let row = -3; row <= 3; row += 1) {
      if (Math.abs(column + row) > 3) continue;
      const centerX = 100 + radius * Math.sqrt(3) * (column + row / 2);
      const centerY = 95 + radius * 1.5 * row;
      const colorIndex = Math.abs(column * 73 + row * 151 + column * row * 17) % colors.length;
      const points = Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI / 180) * (60 * index - 30);
        return `${(centerX + (radius - 1) * Math.cos(angle)).toFixed(1)},${(
          centerY +
          (radius - 1) * Math.sin(angle)
        ).toFixed(1)}`;
      }).join(' ');

      hexagons.push({
        points,
        color: colors[colorIndex],
        opacity: 0.68 + (Math.abs(column * 7 + row * 3) % 4) * 0.08,
      });
    }
  }

  return (
    <svg
      aria-label="Taburan pelajar mengikut tiga tahap pembelajaran"
      className="staff-student-hexagons"
      role="img"
      viewBox="0 0 200 190"
    >
      {hexagons.map((hexagon, index) => (
        <polygon
          fill={hexagon.color}
          key={`${hexagon.points}-${index}`}
          opacity={hexagon.opacity}
          points={hexagon.points}
        />
      ))}
    </svg>
  );
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({
    totalQuizzesAnswered: 0,
    totalStudents: 0,
    totalSubjects: 0,
    totalQuizzesCreated: 0,
    totalParents: 0,
    totalAwards: 0,
    levelBreakdown: { level1: 0, level2: 0, level3: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/staff/overview');
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);


  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard-heading">
        <h1>Overview</h1>
        <div className="staff-dashboard-filters">
          <label className="staff-glass-select">
            <select aria-label="Tapis mengikut subjek" defaultValue="all">
              <option value="all">Semua subjek</option>
              <option value="bm">Bahasa Melayu</option>
              <option value="math">Matematik</option>
              <option value="science">Sains</option>
            </select>
            <ChevronDown aria-hidden="true" size={14} />
          </label>
          <label className="staff-glass-select">
            <select aria-label="Tempoh laporan" defaultValue="7">
              <option value="7">7 hari lepas</option>
              <option value="30">30 hari lepas</option>
            </select>
            <ChevronDown aria-hidden="true" size={14} />
          </label>
        </div>
      </div>

      <section aria-label="Laporan mingguan" className="staff-report-card">
        <div className="staff-report-heading">
          <h2>Laporan</h2>
          <button className="staff-report-period" type="button">
            Mingguan <ChevronDown aria-hidden="true" size={12} />
          </button>
        </div>
        <div className="staff-report-metrics">
          <div>
            <span>Kuiz Dijawab (Terkumpul)</span>
            <strong>{loading ? '...' : stats.totalQuizzesAnswered}</strong>
          </div>
          <div>
            <span>Jumlah Pelajar Berdaftar</span>
            <strong>{loading ? '...' : stats.totalStudents}</strong>
          </div>
        </div>
        <ReportChart />
      </section>

      <section aria-label="Ringkasan admin" className="staff-dashboard-cards">
        <article className="staff-dashboard-card staff-weekly-card">
          <div className="staff-card-title-row">
            <h2>Ringkasan Mingguan</h2>
            <span className="staff-card-actions">
              <button aria-label="Pilih tarikh laporan" type="button"><CalendarDays size={15} /></button>
              <button aria-label="Muat turun laporan" type="button"><ArrowDownToLine size={15} /></button>
            </span>
          </div>
          <div className="staff-weekly-summary">
            <strong>{loading ? '...' : stats.totalQuizzesAnswered} cubaan kuiz</strong>
            <span>▲ 4.2%</span>
            <small>25 Sep - 1 Okt</small>
          </div>
          <WeeklyChart />
        </article>

        <article className="staff-dashboard-card staff-students-card">
          <div className="staff-card-title-row">
            <h2>Pelajar</h2>
            <Link aria-label="Lihat pelajar" href="/staff/users">
              <ExternalLink aria-hidden="true" size={15} />
            </Link>
          </div>
          <StudentHexagons />
          <div className="staff-dashboard-legend staff-level-legend">
            <span><i className="staff-legend-teal" />Tahap 1 <small>({loading ? '..' : stats.levelBreakdown?.level1 ?? 0})</small></span>
            <span><i className="staff-legend-orange" />Tahap 2 <small>({loading ? '..' : stats.levelBreakdown?.level2 ?? 0})</small></span>
            <span><i className="staff-legend-pink" />Tahap 3 <small>({loading ? '..' : stats.levelBreakdown?.level3 ?? 0})</small></span>
          </div>

        </article>

        <article className="staff-dashboard-card staff-engagement-card">
          <div className="staff-card-title-row">
            <h2>Penglibatan</h2>
            <button aria-label="Pilih tempoh penglibatan" type="button"><CalendarDays size={15} /></button>
          </div>
          <div className="staff-engagement-average">
            <span>Purata</span>
            <strong>50%</strong>
          </div>
          <div aria-label="Penglibatan tujuh hari" className="staff-engagement-bars">
            {engagement.map((height, index) => (
              <div className="staff-engagement-day" key={weekDays[index]}>
                <i className={`staff-engagement-bar staff-engagement-color-${index % 4}`} style={{ height: `${height}%` }} />
                <span>{weekDays[index]}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

    </div>
  );
}
