import { createQueryKeys } from "@wiiee/api-client/query-keys";

// 리소스별 Query Key를 한 곳에서 관리
// 컴포넌트에서 직접 문자열 배열을 쓰지 않고 이 파일을 참조
export const postKeys = createQueryKeys("posts");

// 리소스가 늘어나면 여기에 추가
// export const userKeys = createQueryKeys("users");
// export const commentKeys = createQueryKeys("comments");
