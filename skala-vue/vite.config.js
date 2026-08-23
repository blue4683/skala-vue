import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    // 공공데이터포털(data.go.kr) 조석예보 API는 브라우저 직접 호출 시 CORS로 막혀 dev 프록시로 우회한다.
    // npm run dev에서만 동작 — 정적 빌드 배포 시엔 별도 처리 필요 (Stage 10).
    proxy: {
      '/khoa': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/khoa/, '/1192136/tideFcstHghLw'),
      },
      // 기상청 단기예보 조회서비스
      '/kma': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/kma/, '/1360000'),
      },
    },
  },
})
