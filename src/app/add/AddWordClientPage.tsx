"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addWord, addWords, deleteWord } from "@/lib/actions/japanese_vocab";
import type { Word } from "@/lib/data/japanese_vocab";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import EditWordModal from "./EditWordModal";
import AddWordsWithExcelModal from "./AddWordsWithExcelModal";
import AddWordModal from "./AddWordModal";

export default function AddWordClientPage({
  userEmail,
  initialWords,
  currentPage,
  totalPages,
  initialQuery,
}: {
  userEmail: string;
  initialWords: Word[];
  currentPage: number;
  totalPages: number;
  initialQuery: string;
}) {
  const [batchState, batchFormAction] = useActionState(addWords, { error: null });
  const [deleteState, deleteAction] = useActionState(deleteWord, { error: null, message: null });
  const batchFormRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [isAddWordsWithExcelModalOpen, setIsAddWordsWithExcelModalOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("query", searchQuery);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (batchState.error === null && batchState.message) {
      // 성공 시 파일 입력 필드 초기화
      batchFormRef.current?.reset();
      // 일괄 등록 성공 시, 목록을 새로고침하고 모달을 닫습니다.
      router.push(`${pathname}?page=1`);
    } else if (batchState.error) {
      // 에러 발생 시에도 파일 입력 필드 초기화
      batchFormRef.current?.reset();
    }
    setIsSubmitting(false);
  }, [batchState, router, pathname]);

  useEffect(() => {
    if (deleteState.error === null && deleteState.message) {
      // 삭제된 아이템이 현재 페이지의 마지막 아이템이었다면, 이전 페이지로 이동합니다.
      const newPage = initialWords.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    }
    // TODO: 삭제 에러 발생 시 사용자에게 알림 (예: toast)
  }, [deleteState, initialWords.length, currentPage, router, pathname, searchParams]);

  const handleCloseEditModal = (updated: boolean) => {
    setEditingWord(null);
    if (updated) {
      router.refresh();
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

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setIsAddWordModalOpen(true)}
          className="w-full max-w-xs bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          개별 단어 등록
        </button>
        <button
          onClick={() => setIsAddWordsWithExcelModalOpen(true)}
          className="w-full max-w-xs bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          엑셀로 일괄 등록
        </button>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="단어, 뜻, 발음으로 검색..."
            className="flex-grow block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            검색
          </button>
        </form>
      </div>

      {editingWord && <EditWordModal word={editingWord} onClose={handleCloseEditModal} />}

      {isAddWordModalOpen && <AddWordModal onClose={() => setIsAddWordModalOpen(false)} />}

      {isAddWordsWithExcelModalOpen && (
        <AddWordsWithExcelModal onClose={() => setIsAddWordsWithExcelModalOpen(false)} />
      )}

      <div className="mt-8">
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
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              이전
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages} 페이지
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
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
