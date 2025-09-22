import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_APP_BASE?.replace(/\/$/, '') || '/protoflow'
  const port = Number(env.VITE_DEV_PORT || 3001)

  return {
    plugins: [react()],
    base,
    server: {
      host: '0.0.0.0',
      port
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
