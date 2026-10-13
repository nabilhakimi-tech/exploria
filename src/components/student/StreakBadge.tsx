import { Flame } from 'lucide-react'

export default function StreakBadge({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-orange-100/50 px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">
      <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
      <span className="font-bold text-orange-600">{days} Hari</span>
    </div>
  )
}
