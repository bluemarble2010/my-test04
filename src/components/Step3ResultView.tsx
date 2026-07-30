import React, { useState, useRef } from 'react';
import { FieldInputData, CropAnalysisResult } from '../types';
import { AnnotatedImage } from './AnnotatedImage';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Copy,
  Download,
  FileText,
  Check,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Edit3,
  Sparkles,
  ArrowLeft,
  Building,
  User,
  ExternalLink,
  Share2
} from 'lucide-react';

interface Step3ResultViewProps {
  formData: FieldInputData;
  analysisResult: CropAnalysisResult;
  onPrev: () => void;
  onReset: () => void;
}

export const Step3ResultView: React.FC<Step3ResultViewProps> = ({
  formData,
  analysisResult,
  onPrev,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'farmer' | 'staff'>('farmer');

  // Editable document state
  const [farmerGuideText, setFarmerGuideText] = useState(
    analysisResult.farmerGuide ||
      `안녕하세요. ${formData.cropName} 현장 사진 분석 결과, 잎 뒷면의 포자 형상과 반점 패턴으로 보아 [1순위: ${
        analysisResult.suspectedCauses[0]?.name || '원인 미상'
      }] 가능성이 의심됩니다.\n\n[지금 확인하실 사항]\n- 시설 하우스 내부 환기 및 습도 관리 상태를 점검해 주세요.\n\n[즉시 조치 가능한 안전 사항]\n- 병든 잎은 제거하여 비닐봉지에 담아 폐기하십시오.\n\n* 등록 농약과 농약안전정보시스템의 작물별 안전사용기준을 확인하고 농업기술센터와 상담하세요.`
  );

  const [staffRecordText, setStaffRecordText] = useState(
    analysisResult.staffRecord ||
      `[현장 상담기록 일지]\n- 상담일자: ${new Date().toLocaleDateString('ko-KR')}\n- 작물명: ${formData.cropName}\n- 재배지역: ${
        formData.region || '미입력'
      }\n- 재배방식: ${formData.cultivationMethod}\n- 접수 증상: ${
        formData.farmerSymptoms || '미입력'
      }\n\n[AI 진단 요약]\n- 1순위 의심: ${
        analysisResult.suspectedCauses[0]?.name || '미정'
      }\n- 2순위 의심: ${
        analysisResult.suspectedCauses[1]?.name || '해당없음'
      }\n- 피해 심각도: ${analysisResult.severity}\n- 확산 가능성: ${
        analysisResult.spreadRisk
      }\n\n[현장 지도 및 권고사항]\n- 병든 이병 부위 소각 및 과습 방지 조치 지도\n- 정밀 진단이 필요할 경우 농업기술센터 병해충 진단실 의뢰 안내`
  );

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const farmerGuideCardRef = useRef<HTMLDivElement>(null);

  // Copy Summary to Clipboard
  const handleCopyResult = async () => {
    const textToCopy = `[농작물 AI 현장진단 요약보고]
작물명: ${formData.cropName} (${formData.region || '지역 미입력'}, ${formData.cultivationMethod})
1순위 의심: ${analysisResult.suspectedCauses[0]?.name || '미정'}
2순위 의심: ${analysisResult.suspectedCauses[1]?.name || '미정'}
AI 신뢰 수준: ${analysisResult.overallConfidence}
피해 심각도: ${analysisResult.severity}
판단 근거: ${analysisResult.suspectedCauses[0]?.evidence || '사진 분석'}

[권고사항]
${analysisResult.expertDiagnosisReason || '농업기술센터 및 전문기관 진단 권장'}

* 이 결과는 사진을 기반으로 한 AI 참고 분석이며 확정 진단이 아닙니다.`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Export PDF Report
  const handleExportPdf = async () => {
    if (!reportContainerRef.current) return;

    try {
      const element = reportContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9f9f8',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`농작물_현장진단리포트_${formData.cropName}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF 생성 중 오류가 발생했습니다. 브라우저 인쇄 기능을 활용해 주세요.');
    }
  };

  // Export Farmer Guide as PNG Image
  const handleExportFarmerGuidePng = async () => {
    if (!farmerGuideCardRef.current) return;

    try {
      const canvas = await html2canvas(farmerGuideCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `농업인안내서_${formData.cropName}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  };

  // Confidence Level Badge Helper (Uses text + color together)
  const renderConfidenceBadge = (confidence: string) => {
    if (confidence === '높음') {
      return (
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>신뢰 수준: 높음</span>
        </span>
      );
    } else if (confidence === '보통') {
      return (
        <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>신뢰 수준: 보통</span>
        </span>
      );
    } else {
      return (
        <span className="text-xs font-bold text-red-800 bg-red-50 border border-red-300 px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>신뢰 수준: 낮음</span>
        </span>
      );
    }
  };

  const firstCause = analysisResult.suspectedCauses[0];
  const secondCause = analysisResult.suspectedCauses[1];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="text-xs font-bold text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>분석 재검토</span>
          </button>
          <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            진단 완료
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 복사 버튼 */}
          <button
            onClick={handleCopyResult}
            className="text-xs sm:text-sm font-bold text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-800" />
                <span>복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-600" />
                <span>결과 복사</span>
              </>
            )}
          </button>

          {/* 농업인용 PNG 저장 */}
          <button
            onClick={handleExportFarmerGuidePng}
            className="text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-800" />
            <span>설명서 이미지 저장</span>
          </button>

          {/* PDF 저장 */}
          <button
            onClick={handleExportPdf}
            className="text-xs sm:text-sm font-bold text-white bg-emerald-900 hover:bg-emerald-800 px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>PDF 리포트 저장</span>
          </button>
        </div>
      </div>

      {/* Main Printable Container */}
      <div ref={reportContainerRef} className="space-y-6">
        {/* Section 1: Core Key Result Summary Banner */}
        <div className="bg-white rounded-2xl border-2 border-emerald-800/80 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  핵심 진단 요약
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  농작물 AI 현장 분석 보고서
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {formData.cropName} 의심 증상 종합분석 결과
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {renderConfidenceBadge(analysisResult.overallConfidence)}
            </div>
          </div>

          {/* Top Priority Causes Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1순위 의심 */}
            <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-md">
                  1순위 의심
                </span>
                <span className="text-xs font-bold text-stone-600">
                  구분: {firstCause?.category || '병해충/생리장해'}
                </span>
              </div>
              <p className="text-lg font-bold text-emerald-950">
                {firstCause?.name || '분석 중인 병해충/생리장해 가능성'}
              </p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                <strong className="text-stone-900">판단 근거:</strong>{' '}
                {firstCause?.evidence || '관찰된 반점 패턴 및 발생 양상'}
              </p>
            </div>

            {/* 2순위 의심 */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 bg-stone-200 px-2.5 py-0.5 rounded-md">
                  2순위 의심
                </span>
                <span className="text-xs font-bold text-stone-600">
                  구분: {secondCause?.category || '기타'}
                </span>
              </div>
              <p className="text-base font-bold text-stone-900">
                {secondCause?.name || '추가 검토 가능성'}
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                <strong className="text-stone-800">판단 근거:</strong>{' '}
                {secondCause?.evidence || '현장 상태 근거 추가 검토'}
              </p>
            </div>
          </div>

          {/* Risk Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs sm:text-sm">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-xs">피해 심각도</span>
              <span className="font-bold text-stone-900 text-base">
                {analysisResult.severity}
              </span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-xs">확산 가능성</span>
              <span className="font-bold text-stone-900 text-base">
                {analysisResult.spreadRisk}
              </span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-xs">작물 및 지역</span>
              <span className="font-bold text-stone-900 text-sm truncate block">
                {formData.cropName} ({formData.region || '시·군 미입력'})
              </span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-xs">재배방식</span>
              <span className="font-bold text-stone-900 text-sm">
                {formData.cultivationMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Image Inspection & Annotated Layer */}
        {formData.photos.length > 0 && (
          <AnnotatedImage
            photoUrl={formData.photos[0].url}
            photoName={formData.photos[0].name}
            spots={analysisResult.symptomSpots}
          />
        )}

        {/* Section 3: Observed Symptoms & Additional Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 관찰된 주요 증상 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-200 pb-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-800" />
              <span>사진상 관찰된 주요 증상</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-800">
              {analysisResult.observedSymptoms.map((symptom, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 shrink-0 mt-2"></span>
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 현장 추가 확인 사항 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-200 pb-2.5">
              <Info className="w-5 h-5 text-emerald-800" />
              <span>현장에서 추가로 확인할 사항</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-800">
              {analysisResult.additionalChecks.map((check, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2"></span>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 4: Safe Immediate Actions & Expert Consultation */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-200 pb-3">
            <Sparkles className="w-5 h-5 text-emerald-800" />
            <span>즉시 실행 가능한 안전한 지도 조치</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-900 block">
                비화학적 안심 환경관리
              </span>
              <ul className="space-y-1.5 text-stone-800">
                {analysisResult.immediateSafeActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Farm Chemical Notice Requirement */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2 text-amber-950">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>약제 방제 상담 및 안전사용 지침</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                등록 농약과 농약안전정보시스템의 작물별 안전사용기준을 확인하고 농업기술센터와 상담하세요.
              </p>
              <div className="pt-2 text-[11px] text-amber-800 border-t border-amber-200/80">
                * 특정 약제 처방 또는 상품명 언급은 제한되며, 농약안전정보시스템(psis.rda.go.kr) 검색을 권장합니다.
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Two Editable Documents (농업인용 / 담당자용) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-800" />
              <h3 className="font-bold text-stone-900 text-lg">
                작성 결과문 (내용 수정 가능)
              </h3>
            </div>

            {/* Document Type Tabs */}
            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setActiveTab('farmer')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'farmer'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>A. 농업인용 쉬운 설명</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('staff')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'staff'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>B. 담당자용 상담기록</span>
              </button>
            </div>
          </div>

          {/* Tab A: Farmer Easy Guide */}
          {activeTab === 'farmer' && (
            <div ref={farmerGuideCardRef} className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md">
                  농업인 전달용 쉬운 설명서 (약 500자)
                </span>
                <span className="text-xs text-stone-500">
                  * 농업인에게 출력/전송 시 직접 구두로 수정한 내용을 반영할 수 있습니다.
                </span>
              </div>

              <textarea
                rows={10}
                value={farmerGuideText}
                onChange={(e) => setFarmerGuideText(e.target.value)}
                className="w-full p-4 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 text-xs sm:text-sm text-stone-800 leading-relaxed font-mono"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportFarmerGuidePng}
                  className="text-xs font-bold text-emerald-900 bg-white border border-emerald-300 hover:bg-emerald-50 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>설명서 PNG 이미지 다운로드</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab B: Staff Consultation Record */}
          {activeTab === 'staff' && (
            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 bg-stone-200 px-2.5 py-1 rounded-md">
                  담당자용 현장 상담 일지 및 보고서
                </span>
                <span className="text-xs text-stone-500">
                  * 지도사업 상담 기록 관리용 보고서 양식
                </span>
              </div>

              <textarea
                rows={12}
                value={staffRecordText}
                onChange={(e) => setStaffRecordText(e.target.value)}
                className="w-full p-4 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 text-xs sm:text-sm text-stone-800 leading-relaxed font-mono"
              />
            </div>
          )}
        </div>

        {/* Section 6: Mandatory Disclaimer Banner (Required in Prompt) */}
        <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>AI 현장진단 법적 면책 고지 문구</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
            이 결과는 사진을 기반으로 한 AI 참고 분석이며 확정 진단이 아닙니다. 실제 병원체 검사, 토양검정 또는 전문가 진단을 대체할 수 없습니다.
          </p>
        </div>
      </div>

      {/* Bottom Re-diagnosis Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-base px-8 py-4 rounded-xl shadow-md transition-transform hover:scale-102 active:scale-98"
        >
          새로운 농작물 현장진단 시작하기
        </button>
      </div>
    </div>
  );
};
