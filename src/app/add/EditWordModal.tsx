"use client";

import { useActionState, useEffect } from "react";
import { updateWord } from "@/lib/actions/japanese_vocab";
import type { Word } from "@/lib/data/japanese_vocab";

export default function EditWordModal({
  word,
  onClose,
}: {
  word: Word;
  onClose: (updated: boolean) => void;
}) {
  const [state, formAction] = useActionState(updateWord, { error: null, message: null });

  useEffect(() => {
    if (state.error === null && state.message) {
      onClose(true);
    }
  }, [state, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={() => onClose(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">단어 수정</h2>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="wordId" value={word.id} />
          <div>
            <label htmlFor="name-edit" className="block text-sm font-medium">
              단어
            </label>
            <input
              type="text"
              id="name-edit"
              name="name"
              required
              defaultValue={word.name ?? ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="meaning-edit" className="block text-sm font-medium">
              의미
            </label>
            <input
              type="text"
              id="meaning-edit"
              name="meaning"
              required
              defaultValue={word.meaning ?? ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="pronunciation-edit" className="block text-sm font-medium">
              발음
            </label>
            <input
              type="text"
              id="pronunciation-edit"
              name="pronunciation"
              defaultValue={word.pronunciation ?? ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              저장
            </button>
          </div>
          {state.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
        </form>
      </div>
    </div>
  );
}
