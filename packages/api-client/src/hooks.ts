// Client Component에서만 사용 가능 (React hooks 기반)
import {
  useQuery,
  useMutation,
  type QueryKey,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { type AxiosRequestConfig } from "axios";
import { apiClient } from "./client";
import type { ApiError } from "./types";

type Method = "post" | "put" | "patch" | "delete";

/**
 * apiClient.get을 useQuery로 감싼 훅
 *
 * @param queryKey  캐시 키 — 같은 키로 호출하면 캐시 반환 (API 재요청 없음)
 * @param url       요청 경로
 * @param config    axios 요청 설정 (params, headers 등)
 * @param options   useQuery 옵션 (staleTime, enabled 등)
 *
 * @example
 * const { data, isFetching } = useApiQuery<Post[]>(
 *   ["posts"],
 *   "/posts",
 *   { params: { _limit: 5 } },
 *   { staleTime: 1000 * 60 }
 * );
 */
export function useApiQuery<T>(
  queryKey: QueryKey,
  url: string,
  config?: AxiosRequestConfig,
  options?: Omit<UseQueryOptions<T, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<T, ApiError>({
    queryKey,
    queryFn: async () => {
      const res = await apiClient.get<T>(url, config);
      return res.data;
    },
    ...options,
  });
}

/**
 * apiClient의 POST/PUT/PATCH/DELETE를 useMutation으로 감싼 훅
 *
 * @param url     요청 경로
 * @param method  HTTP 메서드 (기본값: "post")
 * @param options useMutation 옵션 (onSuccess, onError 등)
 *
 * @example
 * const { mutate, isPending } = useApiMutation<Post, CreatePostBody>("/posts");
 * mutate({ title: "제목", body: "내용", userId: 1 });
 */
export function useApiMutation<TData, TVariables = unknown>(
  url: string,
  method: Method = "post",
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      const res = await apiClient[method]<TData>(url, variables);
      return res.data;
    },
    ...options,
  });
}
