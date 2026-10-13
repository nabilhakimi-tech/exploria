import { BookOpen, PlayCircle } from 'lucide-react';

interface CourseCardProps {
    title: string;
    description: string;
    lessonsCount: number;
    progress?: number;
    onClick?: () => void;
}

export function CourseCard({ title, description, lessonsCount, progress = 0, onClick }: CourseCardProps) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
            <div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                    <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{description}</p>
            </div>

            <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                    <span>{lessonsCount} Pelajaran</span>
                    <span>{progress}% Selesai</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>
    );
}