import { mockFetchQuizByLevel } from "./mockApi.js";

export const quizService = {
  async getQuestions(level) {
    const res = await mockFetchQuizByLevel(level);

    if (!res.success) {
      throw new Error("Failed to load quiz data");
    }

    return res.data;
  },
};
