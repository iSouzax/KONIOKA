import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { env } from 'node:process'

const repositoryName = env.GITHUB_REPOSITORY?.split('/')[1]

// https://vite.dev/config/
export default defineConfig({
  base: env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/',
  plugins: [react()],
})
