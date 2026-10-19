import React from 'react';
import { ApiTestItem, formatPrice, formatEnglishDate } from '../services/api';
import { Award, ChevronRight } from 'lucide-react';

interface TestSeriesCardProps {
  test: ApiTestItem;
  onOpenTest: (test: ApiTestItem) => void;
}

export const TestSeriesCard: React.FC<TestSeriesCardProps> = ({
  test,
  onOpenTest
}) => {
  const fallbackThumb = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col overflow-hidden group">
      <div className="relative h-36 w-full bg-slate-950 overflow-hidden">
        <img
          src={test.thumb || fallbackThumb}
          alt={test.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackThumb;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow uppercase">
          TEST SERIES
        </div>

        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 text-xs text-white">
          <span className="bg-slate-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-slate-700 font-mono text-[9px]">
            ID: #{test.id}
          </span>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
            {test.title}
          </h3>

          <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
              <span className="font-bold text-amber-500 block text-xs">{test.total_quizzes}</span>
              <span className="text-[10px]">Total Quizzes</span>
            </div>
            <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
              <span className="font-bold text-emerald-500 block text-xs">
                {test.total_questions > 0 ? test.total_questions : 'Unlocked'}
              </span>
              <span className="text-[10px]">Questions</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Fee</span>
            <span className="text-sm font-black text-amber-500">{formatPrice(test.price)}</span>
          </div>

          <button
            onClick={() => onOpenTest(test)}
            className="py-1 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Practice</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
