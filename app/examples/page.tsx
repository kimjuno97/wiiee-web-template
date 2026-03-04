// 외부 API를 호출하므로 빌드 시 정적 생성하지 않고 요청마다 서버에서 렌더링
export const dynamic = "force-dynamic";

import { createApiClient } from "@wiiee/api-client";
import { PostForm } from "./_components/post-form";
import { PostsListClient } from "./_components/posts-list-client";

type Post = {
  id: number;
  title: string;
  content: string;
};

// 서버 컴포넌트에서는 createApiClient로 인스턴스를 직접 생성해 사용
// baseURL을 생략하면 .env.local의 NEXT_PUBLIC_API_URL을 읽음
const serverApi = createApiClient(process.env.NEXT_PUBLIC_API_URL);

async function getPosts(): Promise<Post[]> {
  const res = await serverApi.get<Post[]>("/posts", {
    params: { limit: 5 },
  });
  return res.data;
}

export default async function ExamplesPage() {
  const posts = await getPosts();
  console.log("캐시?? 서버에서 API 호출 결과:", posts);
  return (
    <main className="max-w-2xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-bold">API Client 예시</h1>

      {/* ── Server Component ────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Server Component</h2>
          <p className="text-sm text-gray-500">
            서버에서 데이터를 미리 패칭해 HTML로 렌더링
          </p>
        </div>
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id} className="p-4 border rounded-md">
              <p className="font-medium text-sm">{post.title}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {post.content}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── useApiQuery (React Query 캐싱) ──────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">useApiQuery</h2>
          <p className="text-sm text-gray-500">
            30초 캐시 — 재호출해도 staleTime 이내면 API 요청 없음
          </p>
        </div>
        <PostsListClient />
      </section>

      {/* ── useApiMutation ──────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">useApiMutation</h2>
          <p className="text-sm text-gray-500">
            버튼 클릭으로 클라이언트에서 POST 호출
          </p>
        </div>
        <PostForm />
      </section>
    </main>
  );
}
