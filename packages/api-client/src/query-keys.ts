/**
 * 리소스별 Query Key Factory를 생성하는 유틸리티
 *
 * React Query는 queryKey를 직렬화해서 비교하므로 배열을 매번 새로 만들어도 괜찮지만,
 * 문자열을 직접 쓰면 오타나 범위 실수가 생길 수 있어 한 곳에서 관리하는 것이 안전함.
 *
 * @example
 * const postKeys = createQueryKeys("posts");
 *
 * postKeys.all()                    // ["posts"]
 * postKeys.detail(1)                // ["posts", 1]
 * postKeys.list({ page: 1 })        // ["posts", "list", { page: 1 }]
 * postKeys.list()                   // ["posts", "list", undefined]
 *
 * // 범위 무효화 — "posts"로 시작하는 캐시 전부 날림
 * queryClient.invalidateQueries({ queryKey: postKeys.all() });
 */
export function createQueryKeys<TScope extends string>(scope: TScope) {
  return {
    /** 해당 리소스 전체 — invalidateQueries 범위로 주로 사용 */
    all: () => [scope] as const,
    /** 특정 항목 단건 */
    detail: (id: string | number) => [scope, id] as const,
    /** 목록 (필터/페이지 파라미터 포함 가능) */
    list: (params?: object) => [scope, "list", params] as const,
  };
}
