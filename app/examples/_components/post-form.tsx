"use client";

import { useApiMutation } from "@template/api-client/hooks";
import { Button } from "@template/ui/button";

type Post = { id: number; title: string; body: string };
type CreatePostBody = { title: string; body: string; userId: number };

export function PostForm() {
  const { mutate, data, isPending, error } = useApiMutation<Post, CreatePostBody>("/posts");

  return (
    <div className="space-y-4">
      <Button
        onClick={() => mutate({ title: "새 게시글", body: "내용입니다.", userId: 1 })}
        disabled={isPending}
      >
        {isPending ? "요청 중..." : "POST /posts 호출"}
      </Button>

      {data && (
        <div className="p-4 border rounded-md bg-gray-50 space-y-1">
          <p className="text-xs text-gray-400">ID: {data.id}</p>
          <p className="font-medium text-sm">{data.title}</p>
          <p className="text-xs text-gray-500">{data.body}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
