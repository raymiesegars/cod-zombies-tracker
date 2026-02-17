'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Modal } from './modal';
import { cn } from '@/lib/utils';

interface HelpTriggerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function HelpTrigger({
  title,
  description,
  children,
  size = 'sm',
  className,
  modalSize = 'lg',
}: HelpTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center justify-center rounded-full text-bunker-400 hover:text-blood-400 hover:bg-bunker-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blood-500/50 focus:ring-offset-2 focus:ring-offset-bunker-900',
          size === 'sm' && 'w-7 h-7 min-w-[28px] min-h-[28px]',
          size === 'md' && 'w-8 h-8 min-w-[32px] min-h-[32px]',
          className
        )}
        aria-label={`Help: ${title}`}
      >
        <HelpCircle className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={2} />
      </button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        size={modalSize}
      >
        {children}
      </Modal>
    </>
  );
}
