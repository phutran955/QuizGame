import { apiGet } from "./api.js";


const QUIZ_ID = 19;
const QUIZ_MODE = "basic";

function mapQuestion(question) {

  const type = Number(question.typeQuestion);

  const img = question.imageQuestion;

  // MULTI CHOICE
  if (type === 100) {
    const answers = question.answers.map(a => a.answerName);
    const correctIndex = question.answers.findIndex(
      a => a.isAnswer === true
    );


    if (img !== null || img !== "") {
      return {
        id: question.id,
        question: question.questionName,
        typeQuestion: type,
        img,
        answers,
        correctIndex,
        detailedText: question.detailedAnswer,
      }
    }

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

    if (img !== null || img !== "") {
      return {
        id: question.id,
        question: question.questionName,
        typeQuestion: type,
        img,
        fill: {
          leftText: a.leftText,
          rightText: a.rightText,
          answerText: a.answerText,
        },
        detailedText: question.detailedAnswer,
      }
    }

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
      .filter(q => q.status === QUIZ_MODE)
      .map(mapQuestion)
      .filter(Boolean);
  }
};