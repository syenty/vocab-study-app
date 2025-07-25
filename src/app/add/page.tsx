import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddWordClientPage from "./AddWordClientPage";
import { getWordsForUser } from "@/lib/data/japanese_vocab";

export default async function AddWordPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const words = await getWordsForUser();

  return <AddWordClientPage userEmail={user.email || ""} initialWords={words} />;
}
