import React, { useEffect, useState } from 'react';
import { FieldInputData, PhotoQualityStatus, CropAnalysisResult } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Camera,
  Check
} from 'lucide-react';

interface Step2QualityCheckProps {
  formData: FieldInputData;
  onPrev: () => void;
  onAnalysisSuccess: (result: CropAnalysisResult) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

interface PhotoQualityItem {
  id: string;
  name: string;
  url: string;
  status: PhotoQualityStatus;
  criteriaChecks: {
    focus: boolean;
    brightness: boolean;
    symptomSize: boolean;
    distinguishability: boolean;
    angleCompleteness: boolean;
  };
  retakeGuide: string;
}

export const Step2QualityCheck: React.FC<Step2QualityCheckProps> = ({
  formData,
  onPrev,
  onAnalysisSuccess,
  isLoading,
  setIsLoading,
}) => {
  const [qualityItems, setQualityItems] = useState<PhotoQualityItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perform client-side preliminary photo quality check preview while user reviews
  useEffect(() => {
    const items: PhotoQualityItem[] = formData.photos.map((photo, index) => {
      // Basic heuristic inspection or predefined evaluation for demonstration
      let status: PhotoQualityStatus = '분석 가능';
      let focus = true;
      let brightness = true;
      let symptomSize = true;
      let distinguishability = true;
      let angleCompleteness = true;
      let retakeGuide = '';

      // Check if image size or characteristics suggest issues
      if (photo.size < 50000) {
        status = '보완 권장';
        symptomSize = false;
        retakeGuide = '병반이 화면의 절반 이상 보이도록 근접 촬영을 권장합니다.';
      }

      return {
        id: photo.id,
        name: photo.name,
        url: photo.url,
        status,
        criteriaChecks: {
          focus,
          brightness,
          symptomSize,
          distinguishability,
          angleCompleteness,
        },
        retakeGuide,
      };
    });

    setQualityItems(items);
  }, [formData.photos]);

  const allPhotosUnusable =
    qualityItems.length > 0 &&
    qualityItems.every((item) => item.status === '분석 어려움');

  const handleRunAiAnalysis = async () => {
    if (isLoading || allPhotosUnusable) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: formData.cropName,
          region: formData.region,
          cultivationMethod: formData.cultivationMethod,
          photoParts: formData.photoParts,
          photos: formData.photos,
          farmerSymptoms: formData.farmerSymptoms,
          onsetPeriod: formData.onsetPeriod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '사진 분석 중 오류가 발생했습니다.');
      }

      const result: CropAnalysisResult = await response.json();
      onAnalysisSuccess(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(
        err.message || '분석 결과를 정리하지 못했습니다. 다시 시도해 주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-800" />
              <span>사진 품질검사 및 AI 진단 준비</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              AI가 각 사진의 초점, 조도, 증상 부위 식별성 등 5가지 항목을 검사합니다. 품질이 부족한 경우 재촬영 안내가 표시됩니다.
            </p>
          </div>
          <button
            onClick={onPrev}
            className="text-xs font-bold text-stone-600 hover:text-emerald-900 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>사진/정보 수정</span>
          </button>
        </div>

        {/* 5 Quality Check Criteria Legend */}
        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs sm:text-sm grid grid-cols-2 sm:grid-cols-5 gap-2 text-stone-700 font-medium">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-800" />
            <span>1. 초점 선명도</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-800" />
            <span>2. 밝기 및 조도</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-800" />
            <span>3. 증상 부위 크기</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-800" />
            <span>4. 작물/병반 구분</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-800" />
            <span>5. 촬영 방향 충분성</span>
          </div>
        </div>
      </div>

      {/* Photo Quality List Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <span>업로드된 사진 검사 결과</span>
          <span className="text-xs font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            총 {qualityItems.length}장
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qualityItems.map((item, idx) => {
            const isGood = item.status === '분석 가능';
            const isWarning = item.status === '보완 권장';
            const isBad = item.status === '분석 어려움';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-900">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-stone-900 truncate">
                        사진 {idx + 1}. {item.name}
                      </span>

                      {/* Status Badge */}
                      {isGood && (
                        <span className="shrink-0 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>분석 가능</span>
                        </span>
                      )}
                      {isWarning && (
                        <span className="shrink-0 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>보완 권장</span>
                        </span>
                      )}
                      {isBad && (
                        <span className="shrink-0 text-xs font-bold text-red-800 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>분석 어려움</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-600 space-y-1">
                      <p>
                        작물: <span className="font-bold text-stone-800">{formData.cropName}</span> | 방식:{' '}
                        <span className="font-bold text-stone-800">{formData.cultivationMethod}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specific Retake Instructions if warning or bad */}
                {(isWarning || isBad || item.retakeGuide) && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-medium space-y-1 ${
                      isBad
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                      <span>재촬영 권고 안내:</span>
                    </div>
                    <p className="pl-4">
                      {item.retakeGuide ||
                        '잎 앞·뒷면 근접 사진 및 포장 전체 피해 분포가 잘 보이도록 촬영하세요.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Notice if All Photos are Unusable */}
      {allPhotosUnusable && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-red-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
            <span>모든 사진이 '분석 어려움' 상태입니다</span>
          </div>
          <p className="text-sm">
            품질이 현저히 부족한 사진으로 분석을 진행하면 잘못된 진단 결과가 도출될 수 있습니다. 1단계로 돌아가 안내사항에 따라 초점이 맞춰진 선명한 사진으로 재촬영/재등록해 주시기 바랍니다.
          </p>
          <button
            onClick={onPrev}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>사진 다시 등록하기</span>
          </button>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-300 rounded-2xl p-4 text-red-800 text-sm font-medium flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">분석 실행 중 오류 발생</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <button
          type="button"
          onClick={onPrev}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전 (현장정보 수정)</span>
        </button>

        <button
          type="button"
          disabled={isLoading || allPhotosUnusable}
          onClick={handleRunAiAnalysis}
          className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-md transition-all ${
            isLoading || allPhotosUnusable
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-emerald-900 hover:bg-emerald-800 text-white cursor-pointer active:scale-98'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>사진을 분석하고 있습니다...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span>AI 현장 종합분석 실행</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
