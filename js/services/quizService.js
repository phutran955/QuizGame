import { apiGet } from "./api.js";


const params = new URLSearchParams(window.location.search);

const LESSON_ID = params.get("lessonId") || 72;
const QUIZ_MODE = params.get("status") || "basic";

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
        status: QUIZ_MODE,
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
      status: QUIZ_MODE,
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
        status: QUIZ_MODE,
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
      status: QUIZ_MODE,
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

async function getFullQuestion(question) {
  const detail = await apiGet(`/questions/${question.id}`);

  return mapQuestion(detail);
}

export const quizService = {

  async getQuestions() {

    const lesson = await apiGet(`/lessons/${LESSON_ID}`);

    if (!lesson.questions || lesson.questions.length === 0) {
      return [];
    }

    // 👉 lọc status từ lesson trước
    const filteredQuestions = lesson.questions.filter(
      q => q.status === QUIZ_MODE
    );

    // 👉 lấy chi tiết question + answers
    const fullQuestions = await Promise.all(
      filteredQuestions.map(q => getFullQuestion(q))
    );

    return fullQuestions.filter(Boolean);
  }

};