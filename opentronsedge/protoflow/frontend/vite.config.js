import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // Change the server port to 3000
  server: {
    port: 3001
  },
  // Base path configuration
  base: '',
  // Plugin configuration
  plugins: [
    react({
      include: '**/*.{jsx,tsx}',
    }),
  ],
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Resolve aliases for Opentrons packages
  resolve: {
    alias: {
      '@opentrons/components/styles': path.resolve(
        '../../components/src/index.module.css'
      ),
      '@opentrons/components': path.resolve('../../components/src/index.ts'),
      '@opentrons/shared-data': path.resolve('../../shared-data/js/index.ts'),
      '@opentrons/step-generation': path.resolve(
        '../../step-generation/src/index.ts'
      ),
      '@opentrons/labware-library': path.resolve(
        '../../labware-library/src/labware-creator'
      ),
      '@opentrons/api-client': path.resolve('../../api-client/src/index.ts'),
      '@opentrons/react-api-client': path.resolve(
        '../../react-api-client/src/index.ts'
      ),
    },
  },
  // Define environment variables
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
    },
    global: 'globalThis',
  },
})