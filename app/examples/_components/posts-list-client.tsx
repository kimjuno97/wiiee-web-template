"use client";

import { useApiQuery } from "@template/api-client/hooks";
import { Button } from "@template/ui/button";
import { postKeys } from "@/lib/query-keys";

type Post = { id: number; title: string; body: string };

export function PostsListClient() {
  const { data, isFetching, refetch, dataUpdatedAt } = useApiQuery<Post[]>(
    postKeys.list({ _limit: 5 }),
    "/posts",
    { params: { _limit: 5 } },
    { staleTime: 1000 * 30 } // 30초 캐시 — 이 시간 내 재호출은 API 요청 없음
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "요청 중..." : "다시 불러오기"}
        </Button>
        {dataUpdatedAt > 0 && (
          <p className="text-xs text-gray-400">
            마지막 업데이트: {new Date(dataUpdatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>

      <ul className="space-y-2">
        {data?.map((post) => (
          <li key={post.id} className="p-4 border rounded-md">
            <p className="font-medium text-sm">{post.title}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
