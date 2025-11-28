import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerateAiPostResponse } from "../types/post.js";
import { config } from "../config/env.js";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// 특수 공백 문자 정규식
const WHITESPACE_PATTERNS = {
  NON_BREAKING_SPACE: /\u00A0/g, // Non-breaking space
  UNICODE_SPACES: /[\u2000-\u200B]/g, // 다양한 유니코드 공백
  FULLWIDTH_SPACE: /\u3000/g, // 전각 공백
} as const;

const SPACE = " ";

export const generateGeminiContent = async (
  prompt: string
): Promise<GenerateAiPostResponse> => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error("Gemini API returned empty response");
  }

  const parseAiResponse = (responseText: string): GenerateAiPostResponse => {
    try {
      let cleanedText = responseText.trim();

      // 1. 코드 블록 제거
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      // 2. 특수 공백 문자를 일반 공백으로 치환
      // \u00A0: Non-breaking space
      // \u2000-\u200B: 다양한 유니코드 공백
      cleanedText = cleanedText
        .replace(WHITESPACE_PATTERNS.NON_BREAKING_SPACE, " ")
        .replace(WHITESPACE_PATTERNS.UNICODE_SPACES, " ")
        .replace(WHITESPACE_PATTERNS.FULLWIDTH_SPACE, " ");

      // 3. JSON 파싱
      const result = JSON.parse(cleanedText) as GenerateAiPostResponse;

      return result;
    } catch (error) {
      console.error("❌ JSON 파싱 실패");
      console.error("에러:", error);
      console.error("응답 길이:", responseText.length);

      // 디버깅: 제어 문자 찾기
      const controlChars = responseText.match(/[\x00-\x1F\x7F-\x9F]/g);
      if (controlChars) {
        console.error("발견된 제어 문자:", controlChars);
      }

      throw new Error("AI 응답을 JSON으로 파싱할 수 없습니다");
    }
  };

  const parsedResult = parseAiResponse(text);

  return parsedResult;
};
