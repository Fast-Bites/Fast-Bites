import React from 'react';
import { useNavigate } from 'react-router-dom';
import { responsivePx, responsivePt } from '../constants/responsive';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack, rightElement }) => {
  const navigate = useNavigate();

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-background flex items-center justify-between ${responsivePx} ${responsivePt} pb-3`}>
      <button
        onClick={onBack || (() => navigate(-1))}
        className="w-10 h-10 flex items-center justify-center"
      >
        <img src="/assets/Back.svg" alt="Back" className="w-6 h-6" />
      </button>
      <h1 className="text-foreground text-xl font-semibold">{title}</h1>
      {rightElement || <div className="w-10 h-10" />}
    </div>
  );
};

export default PageHeader;
