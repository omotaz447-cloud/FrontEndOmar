import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 left-4 z-[9999]">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          try {
            if (window.history.length > 1) navigate(-1);
            else navigate('/home');
          } catch (e) {
            navigate('/home');
          }
        }}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        رجوع
      </Button>
    </div>
  );
};

export default BackButton;


