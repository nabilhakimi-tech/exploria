import { Target, Trophy } from 'lucide-react';

interface ChallengeCardProps {
    title: string;
    description: string;
    xpReward: number;
    status?: 'open' | 'submitted' | 'completed';
}

export function ChallengeCard({ title, description, xpReward, status = 'open' }: ChallengeCardProps) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <Target className="w-5 h-5" />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Trophy className="w-3.5 h-3.5" /> +{xpReward} XP
                    </span>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{description}</p>
            </div>

            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors">
                Sertai Cabaran
            </button>
        </div>
    );
}