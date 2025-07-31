import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWordsForUser } from "@/lib/data/japanese_vocab";
import AddWordClientPage from "./AddWordClientPage";

export default async function AddWordPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string; query: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { page, query } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const { words, totalPages } = await getWordsForUser(currentPage);

  return (
    <AddWordClientPage
      userEmail={user.email!}
      initialWords={words}
      currentPage={currentPage}
      totalPages={totalPages}
      initialQuery={query}
    />
  );
}
