"use client";

import { useActionState, useEffect, useRef, useState, useTransition, useCallback } from "react";
import {
  addWord,
  addWords,
  getPaginatedWords,
  deleteWord,
  updateWord,
} from "@/lib/actions/japanese_vocab";
import type { Word } from "@/lib/data/japanese_vocab";
import Link from "next/link";

function EditWordModal({ word, onClose }: { word: Word; onClose: (updated: boolean) => void }) {
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
  const [deleteState, deleteAction] = useActionState(deleteWord, { error: null, message: null });
  const formRef = useRef<HTMLFormElement>(null);
  const batchFormRef = useRef<HTMLFormElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  // 페이지네이션 및 단어 목록 상태 관리
  const [displayedWords, setDisplayedWords] = useState<Word[]>(initialWords);
  const [page, setPage] = useState(currentPage);
  const [total, setTotal] = useState(totalPages);
  const [isPending, startTransition] = useTransition();

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > total || isPending) return;

      startTransition(async () => {
        const result = await getPaginatedWords(newPage);
        if (!result.error) {
          setDisplayedWords(result.words);
          setPage(newPage);
          setTotal(result.totalPages);
        }
      });
    },
    [isPending, total]
  );

  useEffect(() => {
    if (state.error === null && state.message) {
      formRef.current?.reset();
      // 단어 추가 성공 시, 목록을 새로고침합니다.
      handlePageChange(1);
    }
  }, [state, handlePageChange]);

  useEffect(() => {
    if (batchState.error === null && batchState.message) {
      // 성공 시 파일 입력 필드 초기화
      batchFormRef.current?.reset();
      // 일괄 등록 성공 시, 목록을 새로고침하고 모달을 닫습니다.
      handlePageChange(1);
      setIsModalOpen(false);
    } else if (batchState.error) {
      // 에러 발생 시에도 파일 입력 필드 초기화
      batchFormRef.current?.reset();
    }
    setIsSubmitting(false);
  }, [batchState, handlePageChange]);

  useEffect(() => {
    if (deleteState.error === null && deleteState.message) {
      // 삭제된 아이템이 현재 페이지의 마지막 아이템이었다면, 이전 페이지로 이동합니다.
      const newPage = displayedWords.length === 1 && page > 1 ? page - 1 : page;
      handlePageChange(newPage);
    }
    // TODO: 삭제 에러 발생 시 사용자에게 알림 (예: toast)
  }, [deleteState, displayedWords.length, page, handlePageChange]);

  const handleCloseEditModal = (updated: boolean) => {
    setEditingWord(null);
    if (updated) {
      handlePageChange(page);
    }
  };

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

      <div className="mt-8 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full max-w-xs bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          엑셀로 일괄 등록
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">엑셀로 일괄 등록</h2>
              <button
                onClick={() => setIsModalOpen(false)}
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
      )}

      {editingWord && <EditWordModal word={editingWord} onClose={handleCloseEditModal} />}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">등록된 단어 목록</h2>
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-opacity ${
            isPending ? "opacity-50" : "opacity-100"
          }`}
        >
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayedWords.length > 0 ? (
              displayedWords.map((word) => (
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingWord(word)}
                      className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                      aria-label="수정"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"
                        />
                      </svg>
                    </button>
                    <form action={deleteAction}>
                      <input type="hidden" name="wordId" value={word.id} />
                      <button
                        type="submit"
                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        aria-label="삭제"
                        onClick={(e) => {
                          if (!confirm(`'${word.name}' 단어를 정말 삭제하시겠습니까?`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </form>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">등록된 단어가 없습니다.</li>
            )}
          </ul>
        </div>
        {total > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              이전
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {page} / {total} 페이지
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= total || isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
