import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import RTLProvider from './components/RTLProvider';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RTLProvider>
      <Toaster richColors position="top-center" dir="rtl" />
      <App />
    </RTLProvider>
  </StrictMode>,
);
