import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      proxy: {
        '/api/pvwatts': {
          target: 'https://developer.nrel.gov',
          changeOrigin: true,
          rewrite: (p) => {
            const qs = p.replace('/api/pvwatts?', '')
            return `/api/pvwatts/v8.json?api_key=${env.NREL_API_KEY}&${qs}`
          },
        },
        '/api/utility-rates': {
          target: 'https://developer.nrel.gov',
          changeOrigin: true,
          rewrite: (p) => {
            const qs = p.replace('/api/utility-rates?', '')
            return `/api/utility_rates/v3.json?api_key=${env.NREL_API_KEY}&${qs}`
          },
        },
      },
    },
  }
})
