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
  // maplibre-gl은 내부적으로 Worker(new URL(...))로 자체 워커 스크립트를 참조하는데,
  // Vite의 dev 의존성 사전 번들링(esbuild)을 거치면 이 워커가 정상적으로 뜨지 않아
  // 지도가 영원히 로딩 중 상태로 멈춘다. 사전 번들링에서 제외해 원본 ESM 그대로 서빙한다.
  optimizeDeps: {
    exclude: ['maplibre-gl'],
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
