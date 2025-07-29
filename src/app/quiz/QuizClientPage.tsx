"use client";

import { useState, useEffect, useCallback } from "react";
import type { Word } from "@/lib/data/japanese_vocab";
import Link from "next/link";

interface QuizQuestion {
  word: Word;
  question: string;
  choices: string[];
  answer: string;
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

  const generateQuestions = useCallback((words: Word[]): QuizQuestion[] => {
    // 1. 의미가 중복되는 단어들을 찾습니다. (meaning은 같지만 name은 다른 경우)
    const meaningToNamesMap = new Map<string, Set<string>>();
    words.forEach((word) => {
      if (!word.meaning) return;
      if (!meaningToNamesMap.has(word.meaning)) {
        meaningToNamesMap.set(word.meaning, new Set());
      }
      meaningToNamesMap.get(word.meaning)!.add(word.name);
    });

    const ambiguousMeanings = new Set<string>();
    meaningToNamesMap.forEach((names, meaning) => {
      if (names.size > 1) {
        ambiguousMeanings.add(meaning);
      }
    });

    // 2. '뜻 -> 단어' 퀴즈용 단어 풀을 만듭니다. (의미가 고유한 단어만)
    const unambiguousWords = words.filter(
      (word) => word.meaning && !ambiguousMeanings.has(word.meaning)
    );
    const wordsForMeaningToWord = shuffle(unambiguousWords).slice(0, 5);

    // 3. '뜻 -> 단어' 퀴즈 생성
    const allNames = [...new Set(words.map((w) => w.name))];
    const meaningToWordQuestions = wordsForMeaningToWord.map((currentWord) => {
      const correctAnswer = currentWord.name;
      const wrongChoices = shuffle(allNames.filter((n) => n !== correctAnswer)).slice(0, 3);
      const choices = shuffle([correctAnswer, ...wrongChoices]);
      return {
        word: currentWord,
        question: currentWord.meaning!,
        choices,
        answer: correctAnswer,
      };
    });

    // 4. '단어 -> 뜻' 퀴즈용 단어 풀을 만듭니다. (사용한 단어 제외)
    const usedIds = new Set(wordsForMeaningToWord.map((w) => w.id));
    const remainingWords = words.filter((w) => !usedIds.has(w.id));
    const wordsForWordToMeaning = shuffle(remainingWords).slice(0, 5);

    // 5. '단어 -> 뜻' 퀴즈 생성
    const allMeanings = [...new Set(words.map((w) => w.meaning!))];
    const wordToMeaningQuestions = wordsForWordToMeaning.map((currentWord) => {
      const correctAnswer = currentWord.meaning!;
      const wrongChoices = shuffle(allMeanings.filter((m) => m !== correctAnswer)).slice(0, 3);
      const choices = shuffle([correctAnswer, ...wrongChoices]);
      return {
        word: currentWord,
        question: currentWord.name,
        choices,
        answer: correctAnswer,
      };
    });

    // 6. 두 유형의 문제를 합치고 다시 섞음
    return shuffle([...wordToMeaningQuestions, ...meaningToWordQuestions]);
  }, []);

  // 컴포넌트가 마운트될 때 퀴즈 문제 생성
  useEffect(() => {
    setQuestions(generateQuestions(initialWords));
  }, [initialWords, generateQuestions]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === questions[currentQuestionIndex].answer) {
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
  const isCorrect = selectedAnswer === currentQuestion.answer;

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
          <div className="mt-2 flex min-h-[160px] flex-col items-center justify-center rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
            <div>
              <p className="text-5xl font-bold text-gray-900 dark:text-white">
                {currentQuestion.question}
              </p>
              {currentQuestion.question === currentQuestion.word.name &&
                currentQuestion.word.pronunciation && (
                  <p className="mt-2 text-2xl text-gray-500 dark:text-gray-400">
                    [{currentQuestion.word.pronunciation}]
                  </p>
                )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.choices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            const isCorrectChoice = choice === currentQuestion.answer;
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
                className={`flex min-h-[92px] items-center justify-center rounded-lg p-4 text-center text-lg font-semibold shadow-md transition-colors duration-200 disabled:cursor-not-allowed ${buttonClass}`}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {/* 피드백 및 다음 문제 버튼 영역 */}
        <div className="mt-4 h-16 flex items-center justify-center">
          {isAnswered && (
            <div className="animate-fade-in w-full">
              <button
                onClick={handleNextQuestion}
                className={`w-full rounded-md py-3 px-4 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCorrect
                    ? "bg-green-700 hover:bg-green-800 focus:ring-green-600"
                    : "bg-red-700 hover:bg-red-800 focus:ring-red-600"
                }`}
              >
                다음 문제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
