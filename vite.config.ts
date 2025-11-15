import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Giữ lại import path

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'Frontend',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;

          // Trích xuất tên package
          const parts = id.split('node_modules/')[1].split('/');
          const pkgName = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];

          // === SỬA LỖI: GỘP TẤT CẢ ANTD VÀ PHỤ THUỘC CON ===
          // Gộp antd, @ant-design, rc- và @rc-component (nơi có color-picker)
          // vào chung một file 'antd-vendor'.
          if (
            pkgName === 'antd' ||
            pkgName.startsWith('@ant-design') ||
            pkgName.startsWith('rc-') || // Bắt các gói như rc-picker, rc-util...
            pkgName.startsWith('@rc-component') // Bắt @rc-component/color-picker
          ) {
            return 'antd-vendor';
          }
          // =================================================

          // Các quy tắc khác của bạn
          if (pkgName === 'react' || pkgName === 'react-dom') return 'react-vendor';
          if (pkgName === 'react-router-dom') return 'react-router';
          if (pkgName === 'axios') return 'axios';
          if (pkgName === 'lucide-react' || pkgName === 'react-icons') return 'icons';
          if (pkgName === '@reduxjs/toolkit' || pkgName === 'react-redux') return 'redux';

          // Các thư viện khác sẽ tự gộp theo tên
          return pkgName;
        },
      },
    },
    // Giữ lại cấu hình outDir của bạn
    outDir: path.resolve(__dirname, 'Frontend', 'dist'),
  },
});