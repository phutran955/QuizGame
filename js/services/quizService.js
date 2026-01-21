import { apiGet } from "./api.js";

const LEVEL_QUIZ_MAP = {
  1: 19,
  2: 2,
  3: 3,
  4: 8,
};

function mapQuestion(question) {
  const answers = question.answers.map(a => a.answerName);
  const correctIndex = question.answers.findIndex(a => a.isAnswer === true);
  const detailedText = question.detailedAnswer;

  return {
    id: question.id,
    question: question.questionName,
    answers,
    detailedText,
    correctIndex,
  };
}

export const quizService = {

  async getQuestions(level) {
    const quizId = LEVEL_QUIZ_MAP[level];

    if (!quizId) {
      throw new Error(`Chưa map quiz cho level ${level}`);
    }

    const quiz = await apiGet(`/exercises/${quizId}`);

    if (!quiz.questions || quiz.questions.length === 0) {
      return [];
    }

    return quiz.questions.map(mapQuestion);
  },
};