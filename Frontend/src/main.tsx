import { StrictMode } from 'react'
import 'antd/dist/reset.css';
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routers'
import { Provider } from 'react-redux';
import store from './store';
import { App as AntdApp, ConfigProvider, theme } from 'antd';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
        <AntdApp>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)
