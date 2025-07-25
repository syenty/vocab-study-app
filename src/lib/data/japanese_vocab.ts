import "server-only";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export type Word = Database["study"]["Tables"]["japanese_vocab"]["Row"];

export async function getWordsForUser(): Promise<Word[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 호출하는 쪽에서 인증 상태를 확인하므로, 여기서는 빈 배열을 반환합니다.
    return [];
  }

  const { data: words, error } = await supabase
    .from("japanese_vocab")
    .select("*")
    .eq("user_id", user.id)
    .order("created_dt", { ascending: false });

  if (error) {
    console.error("Error fetching words:", error.message);
    // 실제 프로덕션에서는 에러를 던져서 Error Boundary로 처리하는 것이 더 좋습니다.
    // throw new Error('Failed to fetch words.');
    return [];
  }

  return words;
}
