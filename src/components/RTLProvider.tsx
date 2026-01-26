import React, { useEffect } from 'react';

interface RTLProviderProps {
  children: React.ReactNode;
}

const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  useEffect(() => {
    // Set HTML attributes for RTL
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
    
    // Apply RTL class to body for consistent styling
    document.body.classList.add('rtl-container');
    
    // Set document title in Arabic
    document.title = 'نظام إدارة الحسابات المتطور';
  }, []);

  return <div className="rtl-container">{children}</div>;
};

export default RTLProvider;


