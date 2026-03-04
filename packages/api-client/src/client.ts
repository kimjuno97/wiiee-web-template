import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

export function createApiClient(baseURL?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: baseURL ?? process.env.NEXT_PUBLIC_API_URL ?? "",
    timeout: 10_000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // const token = getToken();
      // if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const apiClient = createApiClient();
