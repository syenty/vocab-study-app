"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, signup } from "@/lib/actions/auth";
import Link from "next/link";

function SubmitButton({
  children,
  formAction,
  pendingText,
}: {
  children: React.ReactNode;
  formAction: (payload: FormData) => void;
  pendingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      formAction={formAction}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? pendingText : children}
    </button>
  );
}

export default function LoginPage() {
  const [loginMessage, loginFormAction] = useActionState(login, null);
  const [signupMessage, signupFormAction] = useActionState(signup, null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>

      <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in or create an account to continue
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <SubmitButton formAction={loginFormAction} pendingText="Logging in...">
              Log in
            </SubmitButton>
            <SubmitButton formAction={signupFormAction} pendingText="Signing up...">
              Sign up
            </SubmitButton>
          </div>

          {loginMessage && <p className="mt-4 text-center text-sm text-red-500">{loginMessage}</p>}
          {signupMessage && (
            <p className="mt-4 text-center text-sm text-red-500">{signupMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}
