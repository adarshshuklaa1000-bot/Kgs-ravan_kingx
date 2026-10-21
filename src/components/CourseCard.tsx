import React from 'react';
import { ApiCourseItem, formatPrice, formatEnglishDate } from '../services/api';
import { 
  Video, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  BookOpen,
  Heart
} from 'lucide-react';

interface CourseCardProps {
  course: ApiCourseItem;
  onSelectCourse: (course: ApiCourseItem) => void;
  onQuickPlay: (course: ApiCourseItem) => void;
  isFavourite?: boolean;
  onToggleFavourite?: (course: ApiCourseItem) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelectCourse,
  onQuickPlay,
  isFavourite = false,
  onToggleFavourite
}) => {
  // Determine English category badge
  const getCategoryBadge = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('bpsc')) return 'BPSC / State PCS';
    if (t.includes('upsc') || t.includes('ias')) return 'UPSC / IAS';
    if (t.includes('ssc') || t.includes('railway') || t.includes('rrb') || t.includes('alp') || t.includes('je')) return 'SSC & Railway';
    if (t.includes('math')) return 'Maths Foundation';
    if (t.includes('tre') || t.includes('tet') || t.includes('bstet')) return 'Teaching (TRE)';
    if (t.includes('ai') || t.includes('developer') || t.includes('tech') || t.includes('marketing')) return 'Tech & AI Special';
    if (t.includes('defence') || t.includes('nda') || t.includes('cds')) return 'Defence Forces';
    return 'Special Batch';
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Thumbnail Banner */}
      <div 
        onClick={() => onSelectCourse(course)}
        className="relative h-40 w-full overflow-hidden bg-slate-950 cursor-pointer"
      >
        <img 
          src={course.image || fallbackImage} 
          alt={course.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        {/* Top Badges & Favourite Toggle */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
          <span className="bg-slate-900/90 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1 shadow">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {getCategoryBadge(course.title)}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow uppercase">
              LIVE
            </span>
            {onToggleFavourite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavourite(course);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow cursor-pointer active:scale-90 ${
                  isFavourite
                    ? 'bg-rose-600 text-white shadow-rose-600/50 scale-105'
                    : 'bg-slate-900/80 text-slate-300 hover:text-rose-400 hover:bg-slate-900 border border-slate-700/60'
                }`}
                title={isFavourite ? 'Remove from Favourites' : 'Save to Favourites'}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavourite ? 'fill-current text-white' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Course ID */}
        <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-700">
          ID: #{course.id}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 
            onClick={() => onSelectCourse(course)}
            className="text-xs sm:text-sm font-bold text-white line-clamp-2 hover:text-amber-400 cursor-pointer transition-colors leading-snug"
            title={course.title}
          >
            {course.title}
          </h3>

          {/* Date info */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Starts: {formatEnglishDate(course.start_at)}</span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Price</span>
              <span className="text-base font-black text-amber-400">
                {formatPrice(course.price)}
              </span>
            </div>

            <button
              onClick={() => onQuickPlay(course)}
              className="py-1 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
              title="Start first video lecture"
            >
              <Video className="w-3 h-3" />
              <span>Start Class</span>
            </button>
          </div>

          {/* Enter Classroom Primary Button */}
          <button
            onClick={() => onSelectCourse(course)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 shadow transition-all active:scale-98 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Subjects & Chapters</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
