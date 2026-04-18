
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Explicitly add NODE_ENV to the env object so it's available in the client via process.env.NODE_ENV
  env.NODE_ENV = mode;

  return {
    plugins: [react()],
    base: './', 
    envPrefix: ['VITE_', 'REACT_APP_'], // Allow REACT_APP_ prefix
    define: {
      // Polyfill process.env for legacy compatibility
      'process.env': JSON.stringify(env)
    },
    server: {
      proxy: {
        '/notion-api': {
          target: 'https://api.notion.com/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/notion-api/, ''),
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  }
})
