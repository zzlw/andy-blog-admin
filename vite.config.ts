import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 容器内开发：固定 host/port 与 compose 端口映射对齐
    host: '0.0.0.0',
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          antd: ['antd', '@ant-design/icons'],
          editor: [
            '@uiw/react-codemirror',
            '@codemirror/lang-markdown',
            '@codemirror/language-data',
            'marked',
          ],
        },
      },
    },
  },
})
