import { apiGet } from "./api.js";

const LEVEL_QUIZ_MAP = {
  1: 19,
  2: 2,
  3: 3,
  4: 8,
};

function mapQuestion(question) {

  const type = Number(question.typeQuestion);

  // MULTI CHOICE
  if (type === 100) {
    const answers = question.answers.map(a => a.answerName);
    const correctIndex = question.answers.findIndex(
      a => a.isAnswer === true
    );

    return {
      id: question.id,
      question: question.questionName,
      typeQuestion: type,
      answers,
      correctIndex,
      detailedText: question.detailedAnswer,
    };
  }

  // FILL BLANK
  if (type === 200) {
    const a = question.answers[0];

    return {
      id: question.id,
      question: question.questionName,
      typeQuestion: type,
      fill: {
        leftText: a.leftText,
        rightText: a.rightText,
        answerText: a.answerText,
      },
      detailedText: question.detailedAnswer,
    };
  }

  // FALLBACK
  console.warn("Unsupported question type:", question.typeQuestion);
  return null;
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

    return quiz.questions
  .map(mapQuestion)
  .filter(Boolean);
  },
};