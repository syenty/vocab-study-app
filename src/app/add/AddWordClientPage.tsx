"use client";

import { useActionState, useEffect, useRef } from "react";
import { addWord } from "@/lib/actions/japanese_vocab";
import type { Word } from "@/lib/data/japanese_vocab";
import Link from "next/link";

export default function AddWordClientPage({
  userEmail,
  initialWords,
}: {
  userEmail: string;
  initialWords: Word[];
}) {
  const [state, formAction] = useActionState(addWord, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600">
          &larr; 홈으로
        </Link>
        <span className="text-sm text-gray-500">{userEmail}</span>
      </div>

      <h1 className="text-3xl font-bold text-center mb-2">단어 등록</h1>
      <p className="text-center text-gray-500 mb-8">새로운 단어를 추가하고 목록에서 확인하세요.</p>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
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

      <div>
        <h2 className="text-2xl font-bold mb-4">등록된 단어 목록</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {initialWords.map((word) => (
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
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
