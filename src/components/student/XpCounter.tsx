'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

export default function XpCounter({ xp }: { xp: number }) {
  return (
    <div className="flex items-center gap-2 bg-amber-100/50 px-3 py-1.5 rounded-full border border-amber-200 xp-glow shadow-sm">
      <Trophy className="w-4 h-4 text-amber-500" />
      <motion.span
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-bold text-amber-600"
      >
        {xp} XP
      </motion.span>
    </div>
  )
}
