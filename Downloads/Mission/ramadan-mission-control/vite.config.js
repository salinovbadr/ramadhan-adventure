import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    https: {
      key: './localhost.key',
      cert: './localhost.crt'
    },
    host: true,
    port: 5173
  }
})
