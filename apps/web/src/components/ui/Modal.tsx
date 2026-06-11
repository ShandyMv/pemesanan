import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className={cn("relative flex w-full max-w-md flex-col rounded-xl bg-white shadow-glass", className)}>
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="iconSm"
            className="text-slate-400 hover:text-slate-700"
            aria-label={`Tutup ${title}`}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[75vh] no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
