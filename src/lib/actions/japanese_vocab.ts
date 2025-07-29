"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  error: string | null;
  message?: string | null;
}

export async function addWord(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const name = formData.get("name") as string;
  const meaning = formData.get("meaning") as string;
  const pronunciation = formData.get("pronunciation") as string;

  if (!name || !meaning) {
    return { error: "단어와 뜻은 필수입니다." };
  }

  const { error } = await supabase.from("japanese_vocab").insert({
    name,
    meaning,
    pronunciation,
    user_id: user.id,
  });

  if (error) {
    console.error("Error inserting word:", error);
    return { error: "단어 등록에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/add");
  return { error: null, message: `'${name}' 단어가 성공적으로 등록되었습니다.` };
}
