import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export type Word = Database["study"]["Tables"]["japanese_vocab"]["Row"];

const PAGE_SIZE = 5;

export async function getWordsForUser(page: number = 1) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { words: [], count: 0, totalPages: 0 };
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // 페이지네이션된 데이터와 전체 개수를 병렬로 가져옵니다.
  const [wordsResponse, countResponse] = await Promise.all([
    supabase
      .from("japanese_vocab")
      .select("*")
      .eq("user_id", user.id)
      .order("created_dt", { ascending: false })
      .range(from, to),
    supabase
      .from("japanese_vocab")
      .select("count", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  if (wordsResponse.error) {
    console.error("Error fetching words:", wordsResponse.error.message);
    return { words: [], count: 0, totalPages: 0 };
  }

  const count = countResponse.count ?? 0;

  return {
    words: (wordsResponse.data as Word[]) || [],
    count,
    totalPages: Math.ceil(count / PAGE_SIZE),
  };
}

export async function getWordsForQuiz(): Promise<Word[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: words, error } = await supabase
    .from("japanese_vocab")
    .select("*")
    .eq("user_id", user.id)
    .not("meaning", "is", null); // 퀴즈를 위해 의미가 있는 단어만 가져옵니다.

  if (error) {
    console.error("Error fetching words for quiz:", error.message);
    return [];
  }

  return words || [];
}
