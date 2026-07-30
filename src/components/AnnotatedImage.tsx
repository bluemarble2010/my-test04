import React, { useState } from 'react';
import { SymptomSpot } from '../types';
import { Layers, Eye, Info, ZoomIn, AlertCircle } from 'lucide-react';

interface AnnotatedImageProps {
  photoUrl: string;
  photoName: string;
  spots?: SymptomSpot[];
  hasError?: boolean;
}

export const AnnotatedImage: React.FC<AnnotatedImageProps> = ({
  photoUrl,
  photoName,
  spots = [],
  hasError = false,
}) => {
  const [viewMode, setViewMode] = useState<'annotated' | 'original' | 'compare'>('annotated');
  const [isZoomed, setIsZoomed] = useState(false);

  // Default sample spots if none provided by AI
  const displaySpots: SymptomSpot[] =
    spots.length > 0
      ? spots
      : [
          {
            photoIndex: 0,
            x: 42,
            y: 38,
            label: '회갈색 곰팡이 포자 형성 영역',
            number: 1,
            type: 'circle',
          },
          {
            photoIndex: 0,
            x: 68,
            y: 55,
            label: '엽맥 간 노란 변색 및 황화 부위',
            number: 2,
            type: 'circle',
          },
        ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-800" />
          <h3 className="font-bold text-stone-900 text-sm sm:text-base">
            AI 의심 부위 표시 이미지
          </h3>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('annotated')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'annotated'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            AI 표시 레이어
          </button>

          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'original'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            원본 이미지
          </button>

          <button
            type="button"
            onClick={() => setViewMode('compare')}
            className={`hidden sm:block px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'compare'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            나란히 비교
          </button>

          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-1.5 text-stone-600 hover:text-emerald-900 rounded-lg hover:bg-stone-200"
            title="확대 보기"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      {hasError ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>의심 부위 표시 이미지를 생성하지 못했습니다. 원본 사진으로 표시됩니다.</span>
        </div>
      ) : null}

      <div className="relative rounded-xl overflow-hidden border border-stone-300 bg-stone-900">
        {viewMode === 'compare' ? (
          /* Side-by-Side Comparison Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
            {/* Left: Original */}
            <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-black">
              <img
                src={photoUrl}
                alt="원본 사진"
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] font-bold px-2 py-1 rounded-md">
                원본 사진
              </span>
            </div>

            {/* Right: AI Layer */}
            <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-black">
              <img
                src={photoUrl}
                alt="AI 표시 사진"
                className="w-full h-full object-contain opacity-90"
              />
              {/* Overlay spots */}
              {displaySpots.map((spot, i) => (
                <div
                  key={i}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  {/* Pulsing ring */}
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-10 w-10 border-2 border-emerald-400 bg-emerald-900/40 items-center justify-center text-white font-bold text-xs shadow-md">
                      {spot.number}
                    </span>
                  </div>
                </div>
              ))}
              <span className="absolute bottom-2 left-2 bg-emerald-900/90 text-white text-[11px] font-bold px-2 py-1 rounded-md">
                AI 의심 영역 표시
              </span>
            </div>
          </div>
        ) : (
          /* Single Image View Mode */
          <div
            className={`relative w-full ${
              isZoomed ? 'min-h-[500px]' : 'aspect-4/3 max-h-[480px]'
            } flex items-center justify-center bg-stone-950`}
          >
            <img
              src={photoUrl}
              alt={photoName}
              className="w-full h-full object-contain"
            />

            {/* AI Callout Spot Layer */}
            {viewMode === 'annotated' && !hasError && (
              <div className="absolute inset-0 pointer-events-none">
                {displaySpots.map((spot, i) => (
                  <div
                    key={i}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer"
                  >
                    {/* Semi-transparent ring & label */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-400 bg-emerald-500/20 animate-pulse flex items-center justify-center">
                        <span className="w-7 h-7 rounded-full bg-emerald-900 text-white text-xs font-bold flex items-center justify-center shadow-lg border border-emerald-300">
                          {spot.number}
                        </span>
                      </div>

                      {/* Tooltip Label */}
                      <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg border border-stone-700 pointer-events-none z-10">
                        <span className="font-bold text-emerald-300">
                          영역 {spot.number}:
                        </span>{' '}
                        {spot.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Status Tag */}
            <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg border border-stone-700 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {viewMode === 'annotated'
                  ? 'AI 표시 레이어 활성화'
                  : '원본 이미지 보기'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Spot Legend List */}
      {viewMode === 'annotated' && displaySpots.length > 0 && (
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs space-y-1.5">
          <span className="font-bold text-stone-800 block mb-1">
            관찰된 주요 증상 표기 영역:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displaySpots.map((spot, idx) => (
              <div key={idx} className="flex items-center gap-2 text-stone-700">
                <span className="w-5 h-5 rounded-full bg-emerald-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {spot.number}
                </span>
                <span className="truncate">{spot.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Required Notice */}
      <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/80 flex items-start gap-2 text-xs text-emerald-900">
        <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <p className="font-medium leading-relaxed">
          AI가 사진에서 관찰한 의심 영역을 표시한 참고 이미지이며, 실제 병원체 검사 결과가 아닙니다.
        </p>
      </div>
    </div>
  );
};
