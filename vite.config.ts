import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'Frontend',
  build: {
    rollupOptions: {
      output: {
        // More granular manualChunks: split by package name when possible
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;

          // Extract package name from path
          const parts = id.split('node_modules/')[1].split('/');
          const pkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];

          // Group some large or related packages
          if (pkg === 'react' || pkg === 'react-dom') return 'react-vendor';
          if (pkg === 'react-router-dom') return 'react-router';
          if (pkg === 'antd' || pkg.startsWith('@ant-design')) return 'antd';
          if (pkg === '@ant-design/charts') return 'charts';
          if (pkg === 'axios') return 'axios';
          if (pkg === 'lucide-react' || pkg === 'react-icons') return 'icons';
          if (pkg === '@reduxjs/toolkit' || pkg === 'react-redux') return 'redux';

          // Default to package name (creates many small vendor chunks)
          return pkg;
        },
      },
    },
    // Optional: you can adjust the warning limit (not a fix, only silences warning)
    // chunkSizeWarningLimit: 1000,
    outDir: path.resolve(__dirname, 'Frontend', 'dist'),
  },
});
