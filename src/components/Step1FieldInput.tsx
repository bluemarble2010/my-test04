import React, { useRef } from 'react';
import { FieldInputData, PhotoData } from '../types';
import {
  COMMON_CROPS,
  CULTIVATION_METHODS,
  PHOTO_PARTS,
  COMMON_SYMPTOM_PRESETS,
  ONSET_PERIOD_PRESETS,
  SAMPLE_SCENARIOS
} from '../data/sampleData';
import {
  Upload,
  Camera,
  X,
  MapPin,
  Leaf,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface Step1FieldInputProps {
  formData: FieldInputData;
  onChange: (updated: Partial<FieldInputData>) => void;
  onNext: () => void;
}

export const Step1FieldInput: React.FC<Step1FieldInputProps> = ({
  formData,
  onChange,
  onNext,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // File handle helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = formData.photos.length;
    const remainingSlots = 5 - currentCount;
    if (remainingSlots <= 0) {
      alert('사진은 최대 5장까지 등록할 수 있습니다.');
      return;
    }

    const filesToRead: File[] = (Array.from(files) as File[]).slice(0, remainingSlots);

    filesToRead.forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: PhotoData = {
            id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            url: event.target.result as string,
            name: file.name,
            size: file.size,
          };
          onChange({ photos: [...formData.photos, newPhoto] });
        }
      };
      reader.readAsDataURL(file);
    });

    // reset input
    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    onChange({ photos: formData.photos.filter((p) => p.id !== photoId) });
  };

  const togglePhotoPart = (part: string) => {
    const exists = formData.photoParts.includes(part);
    if (exists) {
      onChange({ photoParts: formData.photoParts.filter((p) => p !== part) });
    } else {
      onChange({ photoParts: [...formData.photoParts, part] });
    }
  };

  // Load sample test scenario
  const handleLoadSampleScenario = (scenarioIndex: number) => {
    const scenario = SAMPLE_SCENARIOS[scenarioIndex];
    if (!scenario) return;

    // Generate sample placeholder canvas images
    const createSampleCanvasImage = (text: string, subText: string, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Soft leaf background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 800, 800);

        // Pattern
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 800; i += 40) {
          ctx.beginPath();
          ctx.arc(i, i, 30, 0, Math.PI * 2);
          ctx.fill();
        }

        // Leaf graphic
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`[현장 촬영 사진 Sample]`, 400, 360);
        ctx.fillText(text, 400, 420);
        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(subText, 400, 470);
      }
      return canvas.toDataURL('image/jpeg');
    };

    const samplePhoto1Url = createSampleCanvasImage(
      scenario.data.cropName + ' 잎 뒷면 근접',
      scenario.data.region + ' 현장 채집 사진 1',
      '#1b4332'
    );
    const samplePhoto2Url = createSampleCanvasImage(
      scenario.data.cropName + ' 포장 피해 상태',
      scenario.data.region + ' 현장 채집 사진 2',
      '#2d6a4f'
    );

    const samplePhotos: PhotoData[] = [
      {
        id: 'sample_1_' + Date.now(),
        url: samplePhoto1Url,
        name: `${scenario.data.cropName}_잎_근접.jpg`,
        size: 152000,
      },
      {
        id: 'sample_2_' + Date.now(),
        url: samplePhoto2Url,
        name: `${scenario.data.cropName}_포장_전체.jpg`,
        size: 184000,
      }
    ];

    onChange({
      cropName: scenario.data.cropName || '토마토',
      region: scenario.data.region || '경상남도 김해시',
      cultivationMethod: (scenario.data.cultivationMethod as any) || '시설',
      photoParts: scenario.data.photoParts || ['잎', '포장 전체'],
      farmerSymptoms: scenario.data.farmerSymptoms || '',
      onsetPeriod: scenario.data.onsetPeriod || '',
      photos: samplePhotos
    });
  };

  const isFormValid = formData.photos.length > 0 && formData.cropName.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Quick Test Preset Selector */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm sm:text-base mb-2">
          <Sparkles className="w-5 h-5 text-emerald-800" />
          <span>빠른 테스트용 샘플 시나리오 불러오기</span>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 mb-3">
          현장에서 테스트할 사진이 없으신 경우, 준비된 현장 샘플 사례를 선택하여 바로 분석해 볼 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSampleScenario(idx)}
              className="text-xs sm:text-sm bg-white hover:bg-emerald-800 hover:text-white text-emerald-900 font-medium px-3.5 py-2 rounded-xl border border-emerald-300 shadow-xs transition-all text-left"
            >
              <span className="font-bold">[{sc.data.cropName}]</span> {sc.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-8 space-y-8 shadow-xs">
        {/* Section 1: Basic Crop & Field Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-800" />
            <span>기본 현장 정보</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 작물명 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-800">
                작물명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cropName}
                onChange={(e) => onChange({ cropName: e.target.value })}
                placeholder="예: 토마토, 고추, 사과 등"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-sm"
              />
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_CROPS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => onChange({ cropName: crop })}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      formData.cropName === crop
                        ? 'bg-emerald-900 text-white font-bold border-emerald-900'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* 재배지역 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-800 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-stone-500" />
                <span>재배지역 (시·군 단위)</span>
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => onChange({ region: e.target.value })}
                placeholder="예: 경상남도 김해시, 충청남도 부여군"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* 재배방식 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-800">
                재배방식
              </label>
              <div className="flex gap-3">
                {CULTIVATION_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => onChange({ cultivationMethod: method })}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                      formData.cultivationMethod === method
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* 촬영 부위 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-800">
                사진 촬영 부위 <span className="text-xs font-normal text-stone-500">(복수 선택 가능)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PHOTO_PARTS.map((part) => {
                  const selected = formData.photoParts.includes(part);
                  return (
                    <button
                      key={part}
                      type="button"
                      onClick={() => togglePhotoPart(part)}
                      className={`py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                        selected
                          ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {part}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Photo Upload */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-800" />
              <span>현장 사진 등록</span>
              <span className="text-xs font-normal text-stone-500">
                (최대 5장, <span className="text-emerald-900 font-bold">{formData.photos.length}</span>/5장)
              </span>
            </h2>
            <span className="text-xs text-stone-500">
              * 스마트폰 카메라 촬영 또는 파일 선택
            </span>
          </div>

          {/* Upload Dropzone */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Upload Buttons */}
            {formData.photos.length < 5 && (
              <>
                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-800 bg-stone-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-1.5 transition-all text-stone-600 hover:text-emerald-900 cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-emerald-800" />
                  <span className="text-xs font-bold">사진 선택</span>
                  <span className="text-[10px] text-stone-600">갤러리 / 앨범</span>
                </button>

                {/* Mobile Camera Direct Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-32 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 flex flex-col items-center justify-center gap-1.5 transition-all text-emerald-900 cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-emerald-800" />
                  <span className="text-xs font-bold">바로 촬영</span>
                  <span className="text-[10px] text-emerald-900">스마트폰 카메라</span>
                </button>
              </>
            )}

            {/* Photo Previews */}
            {formData.photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative h-32 rounded-xl overflow-hidden border border-stone-200 group shadow-2xs bg-stone-900"
              >
                <img
                  src={photo.url}
                  alt={`현장 사진 ${index + 1}`}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  사진 {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110"
                  title="사진 삭제"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <p className="text-[10px] text-stone-200 truncate">{photo.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {formData.photos.length === 0 && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>진단 분석을 위해 현장 사진을 최소 1장 이상 등록해주세요.</span>
            </p>
          )}
        </div>

        {/* Section 3: Farmer Description & Onset Period */}
        <div className="space-y-6 pt-4 border-t border-stone-200">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-800" />
            <span>농업인 관찰 증상 및 시기</span>
            <span className="text-xs font-normal text-stone-500">(선택 입력)</span>
          </h2>

          <div className="space-y-4">
            {/* 농업인 설명 증상 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-800">
                농업인이 설명한 증상
              </label>
              <textarea
                rows={3}
                value={formData.farmerSymptoms}
                onChange={(e) => onChange({ farmerSymptoms: e.target.value })}
                placeholder="농업인이 현장에서 직접 진술한 증상을 기재하거나 아래 자주 사용하는 문구를 클릭하세요."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-sm"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-stone-500 self-center font-medium">자주 쓰는 예시:</span>
                {COMMON_SYMPTOM_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      onChange({
                        farmerSymptoms: formData.farmerSymptoms
                          ? formData.farmerSymptoms + ' ' + preset
                          : preset,
                      })
                    }
                    className="text-xs bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors text-left"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 증상 발생 시기 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-800 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-stone-500" />
                <span>증상 발생 시기</span>
              </label>
              <input
                type="text"
                value={formData.onsetPeriod}
                onChange={(e) => onChange({ onsetPeriod: e.target.value })}
                placeholder="예: 정식 후 30일 경과 시점, 일주일 전부터 발생 등"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-sm"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ONSET_PERIOD_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChange({ onsetPeriod: preset })}
                    className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="pt-6 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            disabled={!isFormValid}
            onClick={onNext}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all ${
              isFormValid
                ? 'bg-emerald-900 hover:bg-emerald-800 text-white cursor-pointer active:scale-98'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span>사진 품질검사 및 AI 분석 진행</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
