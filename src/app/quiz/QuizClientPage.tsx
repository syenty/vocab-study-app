"use client";

import { useState, useEffect } from "react";
import type { Word } from "@/lib/data/japanese_vocab";
import Link from "next/link";

interface QuizQuestion {
  word: Word;
  choices: string[];
}

// 배열을 무작위로 섞는 헬퍼 함수
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function QuizClientPage({ initialWords }: { initialWords: Word[] }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuestions = (words: Word[]): QuizQuestion[] => {
    // 퀴즈에 사용할 모든 의미 목록 (중복 제거)
    const allMeanings = [...new Set(words.map((w) => w.meaning!))];
    const shuffledWords = shuffle(words).slice(0, 10);

    return shuffledWords.map((currentWord) => {
      const correctAnswer = currentWord.meaning!;

      // 정답을 제외한 나머지 의미들 중에서 오답 선택지 3개를 무작위로 추출
      const wrongChoices = shuffle(allMeanings.filter((m) => m !== correctAnswer)).slice(0, 3);

      // 정답 1개 + 오답 3개를 합쳐서 다시 섞음
      const choices = shuffle([correctAnswer, ...wrongChoices]);

      return {
        word: currentWord,
        choices,
      };
    });
  };

  // 컴포넌트가 마운트될 때 퀴즈 문제 생성
  useEffect(() => {
    setQuestions(generateQuestions(initialWords));
  }, [initialWords]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === questions[currentQuestionIndex].word.meaning) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setQuestions(generateQuestions(initialWords));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
  };

  if (questions.length === 0) {
    return <div>퀴즈를 로딩 중입니다...</div>;
  }

  // 모든 문제를 다 풀었을 때 결과 화면 표시
  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-4xl font-bold mb-4">퀴즈 완료!</h1>
        <p className="text-2xl mb-8 text-gray-700 dark:text-gray-300">
          총 {questions.length}문제 중 {score}문제를 맞혔습니다.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleRestart}
            className="rounded-md bg-indigo-600 px-4 py-2 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            다시 풀기
          </button>
          <Link
            href="/"
            className="rounded-md bg-gray-200 px-4 py-2 text-lg font-semibold text-gray-800 shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.word.meaning;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="w-full flex justify-start mb-4">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
          >
            &larr; 퀴즈 종료
          </Link>
        </div>
        <div className="mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            문제 {currentQuestionIndex + 1} / {questions.length}
          </p>
          <div className="mt-2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              {currentQuestion.word.name}
            </p>
            {currentQuestion.word.pronunciation && (
              <p className="text-2xl text-gray-500 dark:text-gray-400 mt-2">
                [{currentQuestion.word.pronunciation}]
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.choices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            const isCorrectChoice = choice === currentQuestion.word.meaning;
            let buttonClass =
              "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white";
            if (isAnswered) {
              if (isCorrectChoice) buttonClass = "bg-green-500 !text-white";
              else if (isSelected) buttonClass = "bg-red-500 !text-white";
              else buttonClass = "bg-gray-200 dark:bg-gray-800 opacity-60";
            }
            return (
              <button
                key={index}
                onClick={() => handleAnswer(choice)}
                disabled={isAnswered}
                className={`p-4 rounded-lg shadow-md text-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed ${buttonClass}`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 animate-fade-in">
            <div className="mb-4 h-8">
              {isCorrect ? (
                <p className="text-2xl font-bold text-green-500">정답입니다!</p>
              ) : (
                <p className="text-2xl font-bold text-red-600">틀렸습니다!</p>
              )}
            </div>
            <button
              onClick={handleNextQuestion}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-xl font-bold"
            >
              다음 문제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
