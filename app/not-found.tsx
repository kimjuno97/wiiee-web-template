import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-sm text-gray-500">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="px-4 py-2 text-sm rounded-md bg-black text-white hover:bg-gray-800"
      >
        홈으로
      </Link>
    </main>
  );
}
