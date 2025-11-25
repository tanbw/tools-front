// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import {BootstrapVueNextResolver} from 'bootstrap-vue-next/resolvers'
import { BButton, BPagination, BTable } from 'bootstrap-vue-next'
// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
    vue(),
    Components({
      resolvers: [BootstrapVueNextResolver(),],
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // 你的 Spring MVC 应用地址
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // 可选
      },
    }
  },
  build: {
    emptyOutDir: true, // 保持为 true，这是最佳实践
    // 如果有需要直接复制的文件，放在 frontend/public 目录下
    // rollupOptions: {
    //   // 可以进一步配置输出，例如将某些文件放在特定子目录
    // }
  }
})