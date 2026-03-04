import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const TOKEN_KEY = "auth_token";

type StoredAuth = {
  token: string;
  refreshToken: string;
  user: unknown;
};

function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function setStoredToken(token: string, refreshToken?: string) {
  const auth = getStoredAuth();
  if (!auth) return;
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({ ...auth, token, ...(refreshToken && { refreshToken }) })
  );
}

function clearStoredAuth() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

/** 서버 컴포넌트용 — 인증 없이 직접 baseURL만 설정 */
export function createApiClient(baseURL?: string): AxiosInstance {
  return axios.create({
    baseURL: baseURL ?? process.env.NEXT_PUBLIC_API_URL ?? "",
    timeout: 10_000,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 클라이언트 컴포넌트용 — Bearer 토큰 자동 주입 + 만료 시 자동 재발급
 *
 * 동작 흐름:
 * 1. 요청마다 localStorage에서 토큰을 읽어 Authorization 헤더에 주입
 * 2. 401 응답 수신 시 refreshToken으로 새 토큰 발급 요청
 * 3. 재발급 성공 → localStorage 갱신 후 원래 요청 자동 재시도
 * 4. 재발급 중 들어온 다른 요청들은 큐에 대기 → 완료 후 일괄 재시도
 * 5. 재발급 실패 → localStorage 초기화 후 홈으로 이동
 */
export const apiClient: AxiosInstance = (() => {
  const instance = createApiClient();

  // 재발급 진행 중 여부 — 중복 재발급 방지
  let isRefreshing = false;
  // 재발급 완료를 기다리는 요청 큐
  let queue: Array<(token: string) => void> = [];

  const flushQueue = (token: string) => {
    queue.forEach((resolve) => resolve(token));
    queue = [];
  };

  // 요청 인터셉터 — Bearer 토큰 주입
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const auth = getStoredAuth();
      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터 — 401 시 토큰 재발급
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // 401이 아니거나 이미 재시도한 요청이면 그냥 reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      const auth = getStoredAuth();

      // refreshToken 없으면 로그아웃 처리
      if (!auth?.refreshToken) {
        clearStoredAuth();
        window.location.href = "/";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // 이미 재발급 중이면 완료될 때까지 큐에서 대기
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(instance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const baseURL =
          process.env.NEXT_PUBLIC_API_URL ?? "";

        const { data } = await axios.post<{
          token: string;
          refreshToken?: string;
        }>(`${baseURL}/auth/refresh`, {
          refreshToken: auth.refreshToken,
        });

        // 새 토큰 저장 (refreshToken도 함께 갱신될 수 있음)
        setStoredToken(data.token, data.refreshToken);

        // 대기 중인 요청들 재시도
        flushQueue(data.token);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return instance(originalRequest);
      } catch {
        // 재발급 실패 — 강제 로그아웃
        clearStoredAuth();
        flushQueue("");
        window.location.href = "/";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return instance;
})();
