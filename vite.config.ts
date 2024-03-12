import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    watch: {
      usePolling: true // Have to explicitly specify polling because I typically run through WSL, where file change detection appears to fumble when the files are in the windows file system, not the linux filesystem.
    }
  }
})
