import { FieldInputData } from '../types';

export const COMMON_CROPS = [
  '토마토', '고추', '오이', '딸기', '사과', '배',
  '수박', '참외', '마늘', '양파', '배추', '무',
  '대파', '벼', '감자', '고구마'
];

export const CULTIVATION_METHODS = ['노지', '시설', '기타'] as const;

export const PHOTO_PARTS = ['잎', '줄기', '열매', '뿌리', '포장 전체'];

export const COMMON_SYMPTOM_PRESETS = [
  '잎 뒷면에 회색 곰팡이가 관찰되고 상부 잎으로 번집니다.',
  '잎에 수침상의 반점이 생기고 차츰 가장자리가 검게 마릅니다.',
  '열매 표면에 오목하게 함몰된 검은 반점이 관찰됩니다.',
  '새순이 둥글게 말리고 잎맥 사이에 황화 현상이 보입니다.',
  '하부 잎부터 노랗게 변색되고 포기 전체가 시듭니다.',
  '줄기 아랫부분이 갈색으로 변하고 물러지는 증상이 있습니다.'
];

export const ONSET_PERIOD_PRESETS = [
  '정식 후 약 30일 경과 시점',
  '일주일 전부터 하부 잎에서 발생',
  '최근 고온다습한 장마철 이후 급증',
  '3~4일 전부터 연속 발생',
  '생육 중기 수확 전 관찰'
];

// High quality sample images (data URLs or reliable SVGs/Canvas placeholders for testing)
export const SAMPLE_SCENARIOS: { name: string; description: string; data: Partial<FieldInputData> }[] = [
  {
    name: '토마토 잎곰팡이병 의심 건',
    description: '김해시 시설하우스 대저 토마토 잎 뒷면 곰팡이 및 반점',
    data: {
      cropName: '토마토',
      region: '경상남도 김해시',
      cultivationMethod: '시설',
      photoParts: ['잎', '포장 전체'],
      farmerSymptoms: '정식 후 40일 경과 후 하부 잎 뒷면에 회색 가루 형태의 포자가 형성되고 잎 앞면이 노랗게 변합니다.',
      onsetPeriod: '일주일 전부터 습한 오전 시간에 관찰됨'
    }
  },
  {
    name: '고추 탄저병 의심 건',
    description: '부여군 노지 고추 열매 원형 함몰 병반',
    data: {
      cropName: '고추',
      region: '충청남도 부여군',
      cultivationMethod: '노지',
      photoParts: ['열매', '잎'],
      farmerSymptoms: '장마 후 열매 표면에 원형으로 오목하게 파인 검은 반점이 생기고 붉게 익은 고추가 무릅니다.',
      onsetPeriod: '최근 집중호우 및 장마 이후 3일 전부터'
    }
  },
  {
    name: '오이 노균병 의심 건',
    description: '익산시 시설 오이 잎맥 다각형 황색 병반',
    data: {
      cropName: '오이',
      region: '전라북도 익산시',
      cultivationMethod: '시설',
      photoParts: ['잎'],
      farmerSymptoms: '잎 앞면에 잎맥으로 둘러싸인 다각형 모양의 황색 반점이 발생하고 뒷면에 회색 곰팡이가 생깁니다.',
      onsetPeriod: '5일 전부터 가온 시설 하우스 내부'
    }
  }
];
