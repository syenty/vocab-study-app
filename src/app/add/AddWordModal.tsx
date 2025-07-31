"use client";

import { useActionState, useEffect, useRef } from "react";
import { addWord } from "@/lib/actions/japanese_vocab";
import { useRouter, usePathname } from "next/navigation";

export default function AddWordModal({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useActionState(addWord, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state.error === null && state.message) {
      formRef.current?.reset();
      // 단어 추가 성공 시, 목록을 새로고침하고 모달을 닫습니다.
      router.push(`${pathname}?page=1`);
      onClose();
    }
  }, [state, router, pathname, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
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
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              등록하기
            </button>
          </div>
          {state.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
          {state.message && <p className="text-green-500 text-sm mt-2">{state.message}</p>}
        </form>
      </div>
    </div>
  );
}
