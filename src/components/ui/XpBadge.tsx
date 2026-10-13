import { Award } from 'lucide-react';

export function XpBadge({ xp }: { xp: number }) {
    return (
        <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-sm border border-amber-300 shadow-sm">
            <Award className="w-4 h-4 text-amber-600" />
            <span>{xp} XP</span>
        </div>
    );
}