# wiiee-web-template

npm workspaces 기반 Next.js 모노레포 템플릿. 별도 모노레포 도구 없이 공통 패키지를 로컬 dependency로 활용하고 Vercel에 바로 배포할 수 있도록 구성되어 있습니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | [Next.js 16](https://nextjs.org) (Turbopack) |
| 런타임 | [React 19](https://react.dev) |
| 언어 | [TypeScript 5](https://www.typescriptlang.org) |
| 스타일 | [Tailwind CSS v4](https://tailwindcss.com) |
| HTTP 클라이언트 | [axios](https://axios-http.com) |
| UI 유틸리티 | [class-variance-authority](https://cva.style), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge) |
| 패키지 관리 | npm workspaces (v7+, 별도 도구 없음) |

---

## 프로젝트 구조

```
wiiee-web-template/
├── package.json              # npm workspaces 설정 + Next.js 앱 겸용
├── tsconfig.base.json        # 공통 TypeScript 설정
├── tsconfig.json             # Next.js TypeScript 설정
├── next.config.js
├── postcss.config.mjs
├── .env.example
│
├── app/                      # Next.js 앱
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css           # Tailwind 설정 포함
│
└── packages/                 # 공통 패키지
    ├── ui/                   # @template/ui — 공통 UI 컴포넌트
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── button.tsx    # Button 컴포넌트 (CVA 기반)
    │       └── utils.ts      # cn() 유틸리티
    │
    └── api-client/           # @template/api-client — HTTP 클라이언트
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── client.ts     # axios 인스턴스 + interceptors
            ├── types.ts      # ApiResponse, ApiError 타입
            └── index.ts      # export 진입점
```

---

## 실행 방법

### 설치

```bash
# 루트에서 한 번만 실행 — 모든 패키지 의존성 일괄 설치
npm install
```

### 개발 서버

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

### Vercel 배포

1. GitHub에 push
2. Vercel에서 프로젝트 import
3. Deploy (Root Directory 설정 불필요)

---

## 패키지 코드 추가 시 주의사항

### 1. 새 UI 컴포넌트 추가 (`@template/ui`)

**컴포넌트 파일은 `src/` 아래에 바로 추가합니다.**

```
packages/ui/src/card.tsx  ✅
packages/ui/src/form/input.tsx  ✅
```

`package.json`의 exports가 와일드카드로 설정되어 있어 별도 등록이 필요 없습니다.

```json
"exports": {
  "./*": "./src/*.tsx"
}
```

단, **서브 디렉토리에 넣은 파일**은 exports 패턴에서 벗어나므로 직접 등록해야 합니다.

```json
"exports": {
  "./form/input": "./src/form/input.tsx"
}
```

### 2. Tailwind 클래스가 적용되지 않을 때

`app/globals.css`의 `@source` 경로가 UI 패키지를 스캔하도록 설정되어 있습니다.

```css
/* globals.css */
@source "../packages/ui/src/**/*.tsx";
```

- `src/` 아래 `.tsx` 파일이면 자동으로 스캔됩니다.
- 파일 확장자가 다르거나 경로가 달라지면 `@source`를 추가해야 합니다.

### 3. 새 패키지 추가 (`packages/` 아래)

새 패키지를 만들면 `next.config.js`의 `transpilePackages`에 등록해야 Next.js가 TypeScript 소스를 직접 읽을 수 있습니다.

```js
// next.config.js
const nextConfig = {
  transpilePackages: [
    "@template/ui",
    "@template/api-client",
    "@template/새패키지",  // 추가
  ],
};
```

> `transpilePackages` 덕분에 패키지에 별도 빌드 과정이 없습니다. 소스 파일(`.ts`, `.tsx`)을 직접 참조하고 Next.js가 컴파일합니다.

### 4. 환경변수

`.env.example`을 참고해 `.env.local`을 생성합니다.

```bash
cp .env.example .env.local
```

`@template/api-client`는 `NEXT_PUBLIC_API_URL` 환경변수를 읽습니다.

```ts
// createApiClient()의 기본 baseURL
process.env.NEXT_PUBLIC_API_URL ?? ""
```
