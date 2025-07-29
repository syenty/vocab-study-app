"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addWord, addWords } from "@/lib/actions/japanese_vocab";
import type { Word } from "@/lib/data/japanese_vocab";
import Link from "next/link";

export default function AddWordClientPage({
  userEmail,
  initialWords,
  currentPage,
  totalPages,
}: {
  userEmail: string;
  initialWords: Word[];
  currentPage: number;
  totalPages: number;
}) {
  const [state, formAction] = useActionState(addWord, { error: null });
  const [batchState, batchFormAction] = useActionState(addWords, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const batchFormRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (state.error === null) {
      formRef.current?.reset();
    }
  }, [state]);

  useEffect(() => {
    if (batchState.error === null) {
      batchFormRef.current?.reset();
    }
    setIsSubmitting(false);
  }, [batchState]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600">
          &larr; 홈으로
        </Link>
        <span className="text-sm text-gray-500">{userEmail}</span>
      </div>

      <h1 className="text-3xl font-bold text-center mb-8">단어 등록</h1>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">개별 단어 등록</h2>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                단어 (Name)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="meaning"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                의미 (Meaning)
              </label>
              <input
                type="text"
                id="meaning"
                name="meaning"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="pronunciation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                발음 (Pronunciation)
              </label>
              <input
                type="text"
                id="pronunciation"
                name="pronunciation"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            등록하기
          </button>
          {state.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
          {state.message && <p className="text-green-500 text-sm mt-2">{state.message}</p>}
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">엑셀로 일괄 등록</h2>
        <p className="text-sm text-gray-500 mb-4">
          엑셀 파일을 사용하여 여러 단어를 한 번에 등록할 수 있습니다.
          <br />
          양식: A열에 단어(name), B열에 뜻(meaning), C열에 발음(pronunciation)을 순서대로
          입력해주세요. (헤더 행 없음)
        </p>
        <form
          ref={batchFormRef}
          action={batchFormAction}
          onSubmit={() => setIsSubmitting(true)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              엑셀 파일
            </label>
            <input
              type="file"
              id="file"
              name="file"
              required
              accept=".xlsx, .xls, .csv"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "등록 중..." : "일괄 등록하기"}
          </button>
          {batchState.error && <p className="text-red-500 text-sm mt-2">{batchState.error}</p>}
          {batchState.message && (
            <p className="text-green-500 text-sm mt-2">{batchState.message}</p>
          )}
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">등록된 단어 목록</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {initialWords.length > 0 ? (
              initialWords.map((word) => (
                <li key={word.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {word.name}{" "}
                      {word.pronunciation && (
                        <span className="text-gray-500 dark:text-gray-400 font-normal">
                          [{word.pronunciation}]
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{word.meaning}</p>
                  </div>
                  {/* TODO: Add edit/delete buttons here */}
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">등록된 단어가 없습니다.</li>
            )}
          </ul>
        </div>
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <Link
              href={`/add?page=${currentPage - 1}`}
              className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={currentPage <= 1}
            >
              이전
            </Link>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages} 페이지
            </span>
            <Link
              href={`/add?page=${currentPage + 1}`}
              className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={currentPage >= totalPages}
            >
              다음
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
