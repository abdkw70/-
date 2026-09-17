import React from 'react';
import { VisualPuzzleClient } from '../../types';
import { Sparkles, HelpCircle, Eye, Compass, Layers, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  puzzle: VisualPuzzleClient;
  selectedIndex: number | null;
  onSelectOption: (index: number) => void;
  disabled?: boolean;
}

export const VisualPuzzleRenderer: React.FC<Props> = ({
  puzzle,
  selectedIndex,
  onSelectOption,
  disabled = false,
}) => {
  const { type, prompt, mainVisual, options, category, difficulty } = puzzle;

  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'easy':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">سهل 🟢</span>;
      case 'hard':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">متقدم 🔥</span>;
      default:
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">متوسط ⚡</span>;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'silhouette_match':
        return { label: 'تطابق الظل البصري', icon: Eye, color: 'text-sky-400' };
      case 'fast_pattern_count':
        return { label: 'عد الأنماط السريع', icon: Sparkles, color: 'text-emerald-400' };
      case 'one_stroke_maze':
        return { label: 'مسار الخط الواحد', icon: Compass, color: 'text-amber-400' };
      case 'missing_puzzle_piece':
        return { label: 'القطعة المفقودة', icon: Layers, color: 'text-purple-400' };
      case 'visual_difference':
        return { label: 'اكتشاف الاختلاف', icon: HelpCircle, color: 'text-pink-400' };
      case 'pattern_completion':
        return { label: 'إكمال المتتالية', icon: CheckCircle2, color: 'text-indigo-400' };
      default:
        return { label: 'لغز بصري', icon: Sparkles, color: 'text-amber-400' };
    }
  };

  const typeInfo = getTypeLabel();
  const IconComponent = typeInfo.icon;

  return (
    <div className="flex flex-col gap-4 text-white select-none">
      {/* Category & Badge Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-4 h-4 ${typeInfo.color}`} />
          <span className="text-xs font-semibold text-slate-300">{typeInfo.label}</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">{category}</span>
        </div>
        {getDifficultyBadge()}
      </div>

      {/* Question Prompt */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 shadow-inner">
        <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed text-center">
          {prompt}
        </p>
      </div>

      {/* Main Visual Stage */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-radial from-sky-500/5 via-transparent to-transparent pointer-events-none" />

        {/* 1. Fast Pattern Count Grid */}
        {type === 'fast_pattern_count' && mainVisual?.gridItems && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 w-full max-w-sm mx-auto py-2">
            {mainVisual.gridItems.map((item: any, idx: number) => (
              <div
                key={idx}
                className="h-10 rounded-lg flex items-center justify-center bg-slate-800/70 border border-slate-700/50 shadow-sm transition-transform hover:scale-105"
                style={{ color: item.color }}
              >
                {item.icon === 'highlighter' && <span className="text-lg">🖍️</span>}
                {item.icon === 'pencil' && <span className="text-lg">✏️</span>}
                {item.icon === 'eraser' && <span className="text-lg">🧼</span>}
                {item.icon === 'star' && <span className="text-lg" style={{ color: item.color }}>★</span>}
                {item.icon === 'circle' && <span className="text-lg" style={{ color: item.color }}>●</span>}
                {item.icon === 'square' && <span className="text-lg" style={{ color: item.color }}>■</span>}
                {item.icon === 'triangle' && <span className="text-lg" style={{ color: item.color }}>▲</span>}
                {item.icon === 'diamond' && <span className="text-lg" style={{ color: item.color }}>◆</span>}
              </div>
            ))}
          </div>
        )}

        {/* 2. SVG or HTML Raw Visual */}
        {mainVisual?.svgContent && (
          <div
            className="w-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: mainVisual.svgContent }}
          />
        )}

        {/* Prompt Hint */}
        {mainVisual?.promptDetails && (
          <p className="text-[11px] text-amber-300/80 font-medium mt-2.5 flex items-center gap-1">
            <span>💡</span> {mainVisual.promptDetails}
          </p>
        )}
      </div>

      {/* 4 Interactive Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
        {options.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={option.id || idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectOption(idx)}
              className={`group relative flex items-center gap-3 p-3.5 rounded-xl border text-right transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.01]'
                  : 'bg-slate-800/70 border-slate-700 hover:bg-slate-800 hover:border-slate-500 active:scale-[0.99]'
              } ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            >
              {/* Option Letter Tag */}
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
                }`}
              >
                {['أ', 'ب', 'ج', 'د'][idx]}
              </span>

              {/* Option Visual (if SVG present) */}
              {option.svgContent && (
                <div
                  className="w-10 h-10 shrink-0 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: option.svgContent }}
                />
              )}

              {/* Option Label */}
              <span className={`text-xs sm:text-sm font-semibold flex-1 leading-snug ${
                isSelected ? 'text-amber-200 font-bold' : 'text-slate-200'
              }`}>
                {option.label || `الخيار ${idx + 1}`}
              </span>

              {/* Selection Checkmark Indicator */}
              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 animate-in fade-in zoom-in-75" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
