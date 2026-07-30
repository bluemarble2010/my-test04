import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase payload limit for base64 photo uploads
app.use(express.json({ limit: '25mb' }));

// Helper to initialize Gemini Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Instruction for Agricultural Extension Crop Assistant
const SYSTEM_INSTRUCTION = `
당신은 대한민국 농촌진흥기관 및 농업기술센터 지도 직원을 지원하는 전문 농작물 AI 현장진단·상담 도우미입니다.

[역할 및 원칙]
1. 사진과 현장정보만을 근거로 의심 증상과 원인을 종합 분석합니다.
2. 병명을 절대 확정(확진)하지 마십시오. "확진", "틀림없이", "반드시 이 병이다" 등의 표현은 엄격히 금지됩니다.
3. 반드시 "의심", "가능성", "사진상 관찰됨" 표현을 사용하십시오.
4. 사진 근거가 부족하면 병명을 추측하지 말고 "현재 사진만으로 판단하기 어려움"으로 표시하십시오.
5. 농약 제품명, 희석배수, 살포 횟수 또는 확정적 약제 처방을 절대 작성하지 마십시오.
6. 방제가 필요할 때에는 반드시 "등록 농약과 농약안전정보시스템의 작물별 안전사용기준을 확인하고 농업기술센터와 상담하세요"라는 안내 문구를 명시하십시오.
7. 병해충뿐만 아니라 병해, 충해, 바이러스 의심, 영양결핍, 수분장해, 온도장해, 약해, 생리장해, 판단 어려움의 가능성을 함께 검토하십시오.

[1단계: 사진 품질 검사 기준]
전송된 각 사진의 품질을 다음 5가지 항목으로 검사하십시오:
- 초점 맞춤 여부
- 밝기 및 조도 적정성 (너무 어둡거나 밝지 않은지)
- 증상 부위 크기 및 식별 가능성
- 작물과 증상 부위 구분 용이성
- 진단에 필요한 촬영 방향 충분성

사진 품질 상태: "분석 가능" | "보완 권장" | "분석 어려움"
- 보완 권장 또는 분석 어려움일 경우, 농업인이 구체적으로 따라할 수 있는 재촬영 안내문(retakeInstructions)을 작성하십시오.
  예: "잎 앞면이 흐립니다. 증상 부위에 초점을 맞춰 다시 촬영하세요.", "잎 뒷면 근접 사진이 필요합니다.", "병반이 화면의 절반 이상 보이도록 가까이 촬영하세요."

[2단계: 분석 및 두 가지 결과 문서 생성]
사진 품질이 "분석 가능" 또는 "보완 권장"인 경우 다음 두 문서를 작성하십시오:
- farmerGuide (농업인용 쉬운 설명): 쉬운 한국어, 약 500자 안팎. 현재 사진에서 보이는 증상, 가능성 있는 원인, 지금 확인할 사항, 즉시 할 수 있는 안전한 비화학적 조치, 전문기관 상담 필요성 포함.
- staffRecord (담당자용 상담기록): 지도 직원이 상담 일지에 바로 복사/수정할 수 있는 격식 갖춘 현장 상담 보고서 형식.

[3단계: 의심 부위 좌표 (symptomSpots)]
사진에서 주요 증상이 관찰된 영역의 x, y 상대 좌표(0~100 퍼센트)와 번호 라벨, 설명을 작성하십시오.

반드시 지정된 JSON 구조로 응답하십시오.
`;

// API Route for Analyzing Crop Photos & Field Data
app.post('/api/analyze-crop', async (req, res) => {
  try {
    const { cropName, region, cultivationMethod, photoParts, photos, farmerSymptoms, onsetPeriod } = req.body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: '최소 1장 이상의 사진이 필요합니다.' });
    }

    const ai = getGeminiClient();

    // Prepare image parts for Gemini
    const imageParts = photos.map((p: { url: string }, index: number) => {
      const match = p.url.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      } else {
        // Default to image/jpeg if raw base64
        return {
          inlineData: {
            mimeType: 'image/jpeg',
            data: p.url.replace(/^data:image\/\w+;base64,/, ''),
          },
        };
      }
    });

    const userPromptText = `
[현장 입력 정보]
- 작물명: ${cropName || '미입력'}
- 재배지역: ${region || '미입력'}
- 재배방식: ${cultivationMethod || '미입력'}
- 촬영 부위: ${Array.isArray(photoParts) ? photoParts.join(', ') : '미입력'}
- 농업인 설명 증상: ${farmerSymptoms || '미입력'}
- 증상 발생 시기: ${onsetPeriod || '미입력'}
- 첨부된 사진 수: ${photos.length}장

위 사진들과 현장정보를 종합 분석하여 요구된 JSON 형식으로 결과를 출력해 주세요.
`;

    // Response Schema Definition
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        photoQuality: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "분석 가능 | 보완 권장 | 분석 어려움" },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            retakeInstructions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["status", "issues", "retakeInstructions"]
        },
        observedSymptoms: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        suspectedCauses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rank: { type: Type.INTEGER },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              evidence: { type: Type.STRING },
              confidence: { type: Type.STRING, description: "낮음 | 보통 | 높음" }
            },
            required: ["rank", "name", "category", "evidence", "confidence"]
          }
        },
        severity: { type: Type.STRING, description: "낮음 | 보통 | 높음 | 판단 어려움" },
        spreadRisk: { type: Type.STRING, description: "낮음 | 보통 | 높음 | 판단 어려움" },
        overallConfidence: { type: Type.STRING, description: "낮음 | 보통 | 높음" },
        additionalPhotos: { type: Type.ARRAY, items: { type: Type.STRING } },
        additionalChecks: { type: Type.ARRAY, items: { type: Type.STRING } },
        immediateSafeActions: { type: Type.ARRAY, items: { type: Type.STRING } },
        expertDiagnosisRequired: { type: Type.BOOLEAN },
        expertDiagnosisReason: { type: Type.STRING },
        farmerGuide: { type: Type.STRING },
        staffRecord: { type: Type.STRING },
        limitations: { type: Type.STRING },
        symptomSpots: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              photoIndex: { type: Type.INTEGER },
              x: { type: Type.NUMBER, description: "상대 X 좌표 (0-100)" },
              y: { type: Type.NUMBER, description: "상대 Y 좌표 (0-100)" },
              label: { type: Type.STRING },
              number: { type: Type.INTEGER },
              type: { type: Type.STRING, description: "circle | arrow | box" }
            },
            required: ["photoIndex", "x", "y", "label", "number"]
          }
        }
      },
      required: [
        "photoQuality",
        "observedSymptoms",
        "suspectedCauses",
        "severity",
        "spreadRisk",
        "overallConfidence",
        "additionalPhotos",
        "additionalChecks",
        "immediateSafeActions",
        "expertDiagnosisRequired",
        "expertDiagnosisReason",
        "farmerGuide",
        "staffRecord",
        "limitations"
      ]
    };

    // Helper to request content from Gemini
    async function callGemini() {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          ...imageParts,
          { text: userPromptText }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2
        }
      });
      return response.text;
    }

    let jsonResponseText = await callGemini();
    let parsedData;

    try {
      parsedData = JSON.parse(jsonResponseText);
    } catch (parseErr) {
      console.warn('JSON parsing failed on 1st attempt, retrying once...', parseErr);
      // Auto retry once as per instruction [9]
      jsonResponseText = await callGemini();
      try {
        parsedData = JSON.parse(jsonResponseText);
      } catch (retryErr) {
        console.error('JSON parsing failed on 2nd attempt', retryErr);
        return res.status(500).json({
          error: '분석 결과를 정리하지 못했습니다. 다시 시도해 주세요.'
        });
      }
    }

    return res.json(parsedData);
  } catch (err: any) {
    console.error('Error during AI analysis:', err);
    return res.status(500).json({
      error: err.message || '사진 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

// Start Express Server
async function main() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
});
