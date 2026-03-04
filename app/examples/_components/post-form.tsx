"use client";

import { useApiMutation } from "@template/api-client/hooks";
import { Button } from "@template/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { postKeys } from "@/lib/query-keys";

type Post = { id: number; title: string; content: string; imageUrl: string | null };
type CreatePostBody = { title: string; content: string; imageUrl?: string };

export function PostForm() {
  const queryClient = useQueryClient();

  const { mutate, data, isPending, error } = useApiMutation<
    Post,
    CreatePostBody
  >("/posts", "post", {
    onSuccess: () => {
      // "posts"로 시작하는 캐시 전부 무효화 → 목록 자동 갱신
      queryClient.invalidateQueries({ queryKey: postKeys.all() });
    },
  });

  return (
    <div className="space-y-4">
      <Button
        onClick={() =>
          mutate({ title: "새 게시글", content: "내용입니다." })
        }
        disabled={isPending}
      >
        {isPending ? "요청 중..." : "POST /posts 호출"}
      </Button>

      {data && (
        <div className="p-4 border rounded-md bg-gray-50 space-y-1">
          <p className="text-xs text-gray-400">ID: {data.id}</p>
          <p className="font-medium text-sm">{data.title}</p>
          <p className="text-xs text-gray-500">{data.content}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
