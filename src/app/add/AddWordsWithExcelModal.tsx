"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { addWords } from "@/lib/actions/japanese_vocab";

export default function AddWordsWithExcelModal({ onClose }: { onClose: () => void }) {
  const [batchState, batchFormAction] = useActionState(addWords, { error: null });
  const batchFormRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (batchState.error === null && batchState.message) {
      // 성공 시 파일 입력 필드 초기화
      batchFormRef.current?.reset();
      // 일괄 등록 성공 시, 목록을 새로고침하고 모달을 닫습니다.
      router.push(`${pathname}?page=1`);
      onClose();
    } else if (batchState.error) {
      // 에러 발생 시에도 파일 입력 필드 초기화
      batchFormRef.current?.reset();
    }
    setIsSubmitting(false);
  }, [batchState, router, pathname, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={() => onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">엑셀로 일괄 등록</h2>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
    </div>
  );
}
