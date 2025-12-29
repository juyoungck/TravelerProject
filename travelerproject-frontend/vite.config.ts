import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// Vite 설정 파일
export default defineConfig({
  plugins: [
    react(),      // React 지원
    tailwindcss() // Tailwind CSS 지원
  ],
})