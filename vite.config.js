import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    
    visualizer({ open: true, filename: 'bundle-analysis.html' }),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB (1 MB)
  },
})
