import React, { useState } from 'react';
import { FieldInputData, CropAnalysisResult } from './types';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { Step1FieldInput } from './components/Step1FieldInput';
import { Step2QualityCheck } from './components/Step2QualityCheck';
import { Step3ResultView } from './components/Step3ResultView';
import { HelpModal } from './components/HelpModal';
import { Sprout } from 'lucide-react';

const initialFormData: FieldInputData = {
  cropName: '',
  region: '',
  cultivationMethod: '노지',
  photoParts: ['잎'],
  photos: [],
  farmerSymptoms: '',
  onsetPeriod: '',
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<FieldInputData>(initialFormData);
  const [analysisResult, setAnalysisResult] = useState<CropAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleUpdateFormData = (updated: Partial<FieldInputData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    if (
      formData.photos.length > 0 &&
      !window.confirm('현재 작성 중인 내용이 초기화됩니다. 새 진단을 작성하시겠습니까?')
    ) {
      return;
    }
    setFormData(initialFormData);
    setAnalysisResult(null);
    setCurrentStep(1);
  };

  const handleSelectStep = (step: 1 | 2 | 3) => {
    if (step === 2 && formData.photos.length === 0) {
      alert('현장 사진을 1장 이상 등록해주세요.');
      return;
    }
    if (step === 3 && !analysisResult) {
      alert('먼저 2단계에서 AI 분석을 완료해주세요.');
      return;
    }
    setCurrentStep(step);
  };

  const handleAnalysisSuccess = (result: CropAnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f8] text-stone-900 flex flex-col font-sans selection:bg-emerald-900 selection:text-white">
      {/* Header Bar */}
      <Header
        onReset={handleReset}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Stepper Navigation */}
      <Stepper
        currentStep={currentStep}
        onSelectStep={handleSelectStep}
        canNavigateToStep2={formData.photos.length > 0}
        canNavigateToStep3={!!analysisResult}
      />

      {/* Main App Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentStep === 1 && (
          <Step1FieldInput
            formData={formData}
            onChange={handleUpdateFormData}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2QualityCheck
            formData={formData}
            onPrev={() => setCurrentStep(1)}
            onAnalysisSuccess={handleAnalysisSuccess}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {currentStep === 3 && analysisResult && (
          <Step3ResultView
            formData={formData}
            analysisResult={analysisResult}
            onPrev={() => setCurrentStep(2)}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-stone-200 py-6 px-4 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-emerald-900 font-bold">
            <Sprout className="w-4 h-4" />
            <span>농작물 AI 현장진단·상담 도우미</span>
          </div>
          <p>
            © 농림축산식품부 및 농업기술센터 현장 지도 지원용 AI 보조 시스템
          </p>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
