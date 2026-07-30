export type PhotoQualityStatus = '분석 가능' | '보완 권장' | '분석 어려움';
export type ConfidenceLevel = '낮음' | '보통' | '높음';
export type SeverityLevel = '낮음' | '보통' | '높음' | '판단 어려움';
export type SpreadRiskLevel = '낮음' | '보통' | '높음' | '판단 어려움';

export interface PhotoQuality {
  status: PhotoQualityStatus;
  issues: string[];
  retakeInstructions: string[];
}

export interface SuspectedCause {
  rank: number;
  name: string;
  category: string; // 병해, 충해, 바이러스 의심, 영양결핍, 수분장해, 온도장해, 약해, 생리장해, 판단 어려움
  evidence: string;
  confidence: ConfidenceLevel;
}

export interface SymptomSpot {
  photoIndex: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  label: string;
  number: number;
  type?: 'circle' | 'arrow' | 'box';
}

export interface CropAnalysisResult {
  photoQuality: PhotoQuality;
  observedSymptoms: string[];
  suspectedCauses: SuspectedCause[];
  severity: SeverityLevel;
  spreadRisk: SpreadRiskLevel;
  overallConfidence: ConfidenceLevel;
  additionalPhotos: string[];
  additionalChecks: string[];
  immediateSafeActions: string[];
  expertDiagnosisRequired: boolean;
  expertDiagnosisReason: string;
  farmerGuide: string;
  staffRecord: string;
  limitations: string;
  symptomSpots?: SymptomSpot[];
}

export interface PhotoData {
  id: string;
  url: string; // base64 data URL
  name: string;
  size: number;
}

export interface FieldInputData {
  cropName: string;
  region: string;
  cultivationMethod: '노지' | '시설' | '기타';
  photoParts: string[]; // 잎, 줄기, 열매, 뿌리, 포장 전체
  photos: PhotoData[];
  farmerSymptoms: string;
  onsetPeriod: string;
}
