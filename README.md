# wiiee-web-template

Vercel 배포에 최적화된 Next.js 모노레포 템플릿.
Turborepo 없이 **npm workspaces**만으로 공통 패키지를 관리한다.

---

## 기술 스택

| 영역            | 라이브러리                  | 버전    |
| --------------- | --------------------------- | ------- |
| 프레임워크      | Next.js (Turbopack)         | ^16     |
| 언어            | TypeScript                  | ^5      |
| 스타일          | Tailwind CSS v4             | ^4      |
| HTTP 클라이언트 | Axios                       | ^1      |
| 서버 상태 관리  | TanStack React Query        | ^5      |
| 전역 상태       | Context API (내장)          | -       |
| UI 유틸         | CVA + clsx + tailwind-merge | -       |
| 패키지 관리     | npm workspaces              | npm v7+ |

---

## 프로젝트 구조

```
wiiee-web-template/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃 (Providers 포함)
│   ├── providers.tsx           # QueryClientProvider + AuthProvider
│   ├── globals.css             # Tailwind 전역 스타일
│   └── examples/              # API Client 사용 예시 페이지
│       └── _components/
│           ├── posts-list-client.tsx   # useApiQuery 예시
│           └── post-form.tsx           # useApiMutation 예시
├── contexts/                   # Context API
│   └── auth-context.tsx        # 유저 정보 + 토큰 관리
├── lib/                        # 앱 전역 유틸
│   └── query-keys.ts           # Query Key Factory 정의
├── packages/                   # 공통 패키지 (npm workspaces)
│   ├── ui/                     # @wiiee/ui — 공통 UI 컴포넌트
│   │   └── src/
│   │       ├── button.tsx
│   │       └── utils.ts        # cn() 유틸
│   └── api-client/             # @wiiee/api-client — HTTP 클라이언트
│       └── src/
│           ├── client.ts       # axios 인스턴스
│           ├── hooks.ts        # useApiQuery, useApiMutation
│           ├── query-keys.ts   # createQueryKeys
│           ├── types.ts        # ApiResponse, ApiError
│           └── index.ts        # createApiClient (서버 컴포넌트용)
├── .env                        # 환경변수 (git 제외)
├── .env.example                # 환경변수 예시
├── next.config.js
├── tsconfig.json
└── package.json                # 루트 — workspaces 정의
```

---

## 실행 방법

```bash
# 1. 의존성 설치 (루트에서 한 번만)
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에서 NEXT_PUBLIC_API_URL 수정

# 3. 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드
npm run build
```

> Node.js 18 이상 필요

---

## 환경변수

| 변수                  | 설명            | 예시                    |
| --------------------- | --------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | 백엔드 API 주소 | `http://localhost:4000` |

`.env` 파일에 공백 없이 작성해야 한다.

```bash
# 올바른 형식
NEXT_PUBLIC_API_URL=http://localhost:4000

# 잘못된 형식 (파싱 오류)
NEXT_PUBLIC_API_URL = http://localhost:4000
```

---

## 주요 개념

### API Client

서버 컴포넌트와 클라이언트 컴포넌트에서 사용 방식이 다르다.

**서버 컴포넌트** — `createApiClient` 직접 사용

```ts
import { createApiClient } from "@wiiee/api-client";

const api = createApiClient(process.env.NEXT_PUBLIC_API_URL);
const res = await api.get<Post[]>("/posts");
```

**클라이언트 컴포넌트** — `useApiQuery` / `useApiMutation` 훅 사용

```ts
import { useApiQuery, useApiMutation } from "@wiiee/api-client/hooks";

// GET (캐싱 포함)
const { data, isFetching } = useApiQuery<Post[]>(
  postKeys.list({ limit: 5 }),
  "/posts",
  { params: { limit: 5 } },
  { staleTime: 1000 * 30 },
);

// POST
const { mutate } = useApiMutation<Post, CreatePostBody>("/posts");
mutate({ title: "제목", content: "내용" });
```

### Query Key Factory

캐시 키를 문자열로 직접 쓰면 오타와 범위 무효화가 어렵다.
`createQueryKeys`로 리소스별 키를 한 곳에서 관리한다.

```ts
// lib/query-keys.ts
export const postKeys = createQueryKeys("posts");

postKeys.all(); // ["posts"]
postKeys.list({ limit: 5 }); // ["posts", "list", { limit: 5 }]
postKeys.detail(1); // ["posts", 1]

// 목록 전체 무효화
queryClient.invalidateQueries({ queryKey: postKeys.all() });
```

새 리소스가 생기면 `lib/query-keys.ts`에 한 줄 추가하면 된다.

```ts
export const userKeys = createQueryKeys("users");
```

### AuthContext

유저 정보와 토큰을 전역으로 관리한다. localStorage에 영속화되어 새로고침 후에도 유지된다.

```ts
import { useAuth } from "@/contexts/auth-context";

const { user, token, login, logout } = useAuth();
```

`login(token, user)` 호출 시 localStorage에 저장되며, `logout()` 시 제거된다.

---

## API Route를 쓰지 않는 이유

Next.js의 API Route(`app/api/`)는 **다음 상황에서만** 사용한다.

| 상황                         | 이유                                              |
| ---------------------------- | ------------------------------------------------- |
| 민감한 API 키를 숨겨야 할 때 | 클라이언트에 키 노출 방지                         |
| 서드파티 Webhook 수신        | 외부 서비스가 Next.js 서버로 직접 호출            |
| 파일 업로드 전처리           | 서버에서 스트림 처리 필요                         |
| BFF 패턴                     | 여러 API를 조합해 클라이언트에 최적화된 응답 제공 |

그 외의 경우 API Route를 거치면 **클라이언트 → Next.js → 백엔드**로 불필요한 홉이 추가된다.
서버 컴포넌트에서는 `createApiClient`로, 클라이언트 컴포넌트에서는 `useApiQuery`/`useApiMutation`으로 백엔드에 직접 요청한다.

---

## 수정 시 주의사항

### 1. 새 공통 패키지 추가

`packages/` 아래에 패키지를 추가하면 세 곳을 함께 수정해야 한다.

```js
// next.config.js — transpilePackages에 추가 (빌드 시 소스 직접 참조)
transpilePackages: ["@wiiee/ui", "@wiiee/api-client", "@wiiee/새패키지"];
```

```json
// 루트 package.json — dependencies에 추가
"@wiiee/새패키지": "*"
```

추가 후 `npm install` 실행 (심링크 재생성).

### 2. UI 패키지에 새 컴포넌트 추가

Tailwind v4는 소스 파일을 자동 스캔하지 못하므로 `globals.css`의 `@source`로 경로를 명시한다.
기존 경로(`packages/ui/src/**/*.tsx`)를 따르면 추가 설정 없이 클래스가 인식된다.

```css
/* app/globals.css */
@source "../packages/ui/src/**/*.tsx";
```

### 3. 경로 alias (`@/`)

`tsconfig.json`의 `@/*`는 **프로젝트 루트**를 가리킨다.

```ts
import { postKeys } from "@/lib/query-keys"; // lib/query-keys.ts
import { useAuth } from "@/contexts/auth-context"; // contexts/auth-context.tsx
```

`app/` 내부 경로에 `@/app/...`처럼 쓰지 않도록 주의한다.

---

## Vercel 배포

1. GitHub에 푸시
2. Vercel에서 레포 연결
3. Environment Variables에 `NEXT_PUBLIC_API_URL` 추가 (프로덕션 API 주소)
4. Deploy

빌드 커맨드(`npm run build`)와 루트 디렉터리는 Vercel이 자동 감지한다.
