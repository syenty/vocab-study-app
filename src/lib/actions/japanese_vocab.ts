"use server";

import * as XLSX from "xlsx";
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

export async function addWords(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "엑셀 파일을 선택해주세요." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
    });

    if (data.length === 0) {
      return { error: "엑셀 파일에 데이터가 없습니다." };
    }

    const wordsToInsert = data
      .map((row) => ({
        name: row[0] ? String(row[0]) : null,
        meaning: row[1] ? String(row[1]) : null,
        pronunciation: row[2] ? String(row[2]) : null,
        user_id: user.id,
      }))
      .filter((word) => word.name && word.meaning);

    if (wordsToInsert.length === 0) {
      return { error: "등록할 유효한 단어가 없습니다. name과 meaning 열을 확인해주세요." };
    }

    const { error } = await supabase.from("japanese_vocab").insert(wordsToInsert);

    if (error) {
      console.error("Error inserting multiple words:", error);
      return {
        error: "단어 일괄 등록에 실패했습니다. 데이터 형식을 확인하거나 다시 시도해주세요.",
      };
    }

    revalidatePath("/add");
    return {
      error: null,
      message: `${wordsToInsert.length}개의 단어가 성공적으로 등록되었습니다.`,
    };
  } catch (e) {
    console.error("Error processing Excel file:", e);
    return { error: "엑셀 파일을 처리하는 중 오류가 발생했습니다." };
  }
}
