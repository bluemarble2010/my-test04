import React from 'react';
import { X, Sprout, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              「농작물 AI 현장진단·상담 도우미」 이용 안내
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
            <h3 className="font-bold text-emerald-950 text-sm">
              서비스 개발 목적 및 활용범위
            </h3>
            <p>
              본 서비스는 사진을 통해 병명을 definitive(확진)하는 목적이 아니며, 지도 직원이 현장에서 관찰되는 증상을 종합 정리하고 의심 원인과 추가 확인사항을 제시하여 농업 상담기록 작성을 돕는 도우미입니다.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-800" />
              <span>진단 절차 (3단계)</span>
            </h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>1단계 (현장정보/사진)</strong>: 작물명, 재배지역, 재배방식, 촬영부위, 현장사진(최대 5장), 농업인 진술 증상을 입력합니다.
              </li>
              <li>
                <strong>2단계 (품질검사/분석)</strong>: 초점, 조도, 크기, 작물/증상 구분, 촬영 방향 5개 기준 품질을 검사 후 분석을 수행합니다.
              </li>
              <li>
                <strong>3단계 (결과확인/저장)</strong>: 1·2순위 의심 원인, AI 표시 레이어, 농업인용/담당자용 결과문 수정 및 PDF/PNG/복사를 이용합니다.
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>작성 원칙 및 주의사항</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>"확진", "틀림없이" 표현은 엄격히 배제되며 "의심", "가능성"으로 표현됩니다.</li>
              <li>특정 농약 제품명이나 희석배수는 생성되지 않으며, 농약안전정보시스템(psis.rda.go.kr) 검색을 안내합니다.</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              이 결과는 사진을 기반으로 한 AI 참고 분석이며 확정 진단이 아닙니다. 실제 병원체 검사, 토양검정 또는 전문가 진단을 대체할 수 없습니다.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-900 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-800 transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
