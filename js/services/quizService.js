import { apiGet } from "./api.js";

const QUIZ_ID = 19; 

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

async getQuestions() {
  const quiz = await apiGet(`/exercises/${QUIZ_ID}`);

  if (!quiz.questions || quiz.questions.length === 0) {
    return [];
  }

  return quiz.questions
    .map(mapQuestion)
    .filter(Boolean);
}

};