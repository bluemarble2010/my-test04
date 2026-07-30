import React from 'react';
import { Sprout, HelpCircle, FileText, Building2 } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onOpenHelp }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div 
          onClick={onReset} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-800 transition-colors">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                농진청·기술센터 현장지원
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight leading-tight">
              농작물 AI 현장진단·상담 도우미
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-emerald-900 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
            title="사용 방법 및 진단 가이드"
          >
            <HelpCircle className="w-4 h-4 text-emerald-800" />
            <span className="hidden sm:inline">사용가이드</span>
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 text-stone-600" />
            <span>새 진단 작성</span>
          </button>
        </div>
      </div>
    </header>
  );
};
