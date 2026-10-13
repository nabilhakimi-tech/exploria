'use client'

import { motion } from 'framer-motion'

export default function LevelBadge({ level, progress }: { level: number; progress: number }) {
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - progress * circumference

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative flex items-center justify-center w-10 h-10 level-glow"
    >
      <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0">
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-slate-200"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-indigo-600 transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="text-sm font-bold text-indigo-700 z-10">{level}</span>
    </motion.div>
  )
}
