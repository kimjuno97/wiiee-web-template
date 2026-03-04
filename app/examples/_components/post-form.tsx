"use client";

import { useState } from "react";
import { apiClient } from "@template/api-client";
import type { ApiError } from "@template/api-client/types";
import { Button } from "@template/ui/button";
import { isAxiosError } from "axios";

type Post = {
  id: number;
  title: string;
  body: string;
};

export function PostForm() {
  const [result, setResult] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiClient.post<Post>("/posts", {
        title: "새 게시글",
        body: "api-client로 생성한 게시글입니다.",
        userId: 1,
      });
      setResult(res.data);
    } catch (err) {
      // isAxiosError로 타입을 좁혀 서버 에러 메시지 추출
      if (isAxiosError<ApiError>(err)) {
        setError(err.response?.data?.message ?? err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "요청 중..." : "POST /posts 호출"}
      </Button>

      {result && (
        <div className="p-4 border rounded-md bg-gray-50 space-y-1">
          <p className="text-xs text-gray-400">ID: {result.id}</p>
          <p className="font-medium text-sm">{result.title}</p>
          <p className="text-xs text-gray-500">{result.body}</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
