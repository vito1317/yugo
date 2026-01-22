
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, SubTask } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 將人生清單任務拆解為子任務
export const decomposeTask = async (taskTitle: string): Promise<Omit<SubTask, 'id' | 'isCompleted'>[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `將這個人生清單任務「${taskTitle}」拆解成三個難度的子任務：簡單 (EASY)、中等 (MEDIUM)、困難 (HARD)。請用繁體中文回答。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["EASY", "MEDIUM", "HARD"] },
            points: { type: Type.NUMBER }
          },
          required: ["description", "difficulty", "points"]
        }
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("AI returned empty text content");
    return JSON.parse(text);
  } catch (error) {
    return [
      { description: `開始「${taskTitle}」的第一步`, difficulty: Difficulty.EASY, points: 10 },
      { description: `持續執行「${taskTitle}」的核心內容`, difficulty: Difficulty.MEDIUM, points: 30 },
      { description: `成功達成「${taskTitle}」的終極目標`, difficulty: Difficulty.HARD, points: 60 },
    ];
  }
};

// 根據收成的作物生成一段勵志語錄
export const getHarvestMessage = async (cropName: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `用戶剛剛在「有果」App 中收成了他親手灌溉的「${cropName}」。請寫一段短小精悍（20字以內）且富有詩意的祝福語，內容要將「農作物的收成」比喻為「人生清單目標的達成」，強調誠實努力必有結果。`,
    config: {
      temperature: 0.8,
    }
  });

  return response.text?.trim() || `每一分耕耘，都將在未來的某個時刻開花結果。`;
};
