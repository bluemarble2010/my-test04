import React from 'react';
import { Camera, SearchCheck, FileCheck } from 'lucide-react';

interface StepperProps {
  currentStep: 1 | 2 | 3;
  onSelectStep: (step: 1 | 2 | 3) => void;
  canNavigateToStep2: boolean;
  canNavigateToStep3: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onSelectStep,
  canNavigateToStep2,
  canNavigateToStep3,
}) => {
  const steps = [
    {
      id: 1 as const,
      name: '1단계: 현장정보 및 사진 등록',
      shortName: '1. 정보 및 사진',
      icon: Camera,
      enabled: true,
    },
    {
      id: 2 as const,
      name: '2단계: 사진 품질검사 및 AI 분석',
      shortName: '2. 품질검사·분석',
      icon: SearchCheck,
      enabled: canNavigateToStep2,
    },
    {
      id: 3 as const,
      name: '3단계: 결과 확인 및 저장',
      shortName: '3. 결과 및 저장',
      icon: FileCheck,
      enabled: canNavigateToStep3,
    },
  ];

  return (
    <div className="w-full bg-white border-b border-stone-200 py-3 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between w-full">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <li key={step.id} className="relative flex-1 flex items-center">
                  <button
                    disabled={!step.enabled}
                    onClick={() => onSelectStep(step.id)}
                    className={`group w-full flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left p-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-emerald-900 text-white font-bold shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-900 font-medium hover:bg-emerald-100 cursor-pointer'
                        : step.enabled
                        ? 'text-stone-700 hover:bg-stone-100 cursor-pointer font-medium'
                        : 'text-stone-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white text-emerald-900'
                          : isCompleted
                          ? 'bg-emerald-900 text-white'
                          : 'bg-stone-100 text-stone-600 border border-stone-300'
                      }`}
                    >
                      {step.id}
                    </span>

                    <div className="mt-1 sm:mt-0 flex flex-col">
                      <span className="hidden md:inline text-xs sm:text-sm font-semibold">
                        {step.name}
                      </span>
                      <span className="md:hidden text-xs font-semibold">
                        {step.shortName}
                      </span>
                    </div>
                  </button>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden sm:block h-0.5 w-6 sm:w-12 mx-1 shrink-0 ${
                        currentStep > step.id ? 'bg-emerald-800' : 'bg-stone-200'
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
