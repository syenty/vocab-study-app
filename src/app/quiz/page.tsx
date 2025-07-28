import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWordsForQuiz } from "@/lib/data/japanese_vocab";
import QuizClientPage from "./QuizClientPage";
import Link from "next/link";

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const words = await getWordsForQuiz();

  if (words.length < 10) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4">퀴즈를 시작할 수 없습니다.</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          퀴즈를 생성하려면 최소 10개의 단어가 필요합니다. 단어를 더 등록해주세요.
        </p>
        <Link
          href="/add"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          단어 등록하러 가기
        </Link>
      </div>
    );
  }

  return <QuizClientPage initialWords={words} />;
}
