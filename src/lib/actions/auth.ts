"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(prevState: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return "Error: Could not authenticate user.";
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(prevState: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return "Error: Could not sign up user. The user may already exist or the password may be too weak.";
  }

  revalidatePath("/", "layout");
  redirect("/");
}
