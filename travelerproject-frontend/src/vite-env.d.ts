/// <reference types="vite/client" />

/**
 * 환경변수 타입 정의
 */
interface ImportMetaEnv {
  /** API 서버 기본 URL */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}