import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-end p-6 lg:px-8" aria-label="Global">
          <Link
            href="/login" // 로그인 페이지 경로 (추후 생성)
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
          >
            로그인 <span aria-hidden="true">&rarr;</span>
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            나의 단어장
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            새로운 단어를 등록하고 퀴즈로 복습하며 어휘력을 키워보세요.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/add"
              className="rounded-md bg-indigo-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              단어 등록
            </Link>
            <Link
              href="/quiz"
              className="rounded-md bg-green-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              퀴즈 시작
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
