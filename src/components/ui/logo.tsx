'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'hero';
  animated?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
  '3xl': 'w-36 h-36',
  hero: 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48',
};

// Mystery Box Logo - The iconic golden question mark
export function Logo({ size = 'md', animated = true, className }: LogoProps) {
  return (
    <motion.div
      className={cn('relative', sizeStyles[size], className)}
      initial={false}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer golden glow ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="46"
          stroke="url(#glowGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          initial={{ opacity: 0.55 }}
          animate={animated ? { 
            opacity: [0.55, 0.95, 0.55],
            strokeWidth: [2.5, 4.5, 2.5]
          } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Box outer frame */}
        <motion.rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="8"
          fill="url(#boxGradient)"
          stroke="#92400e"
          strokeWidth="3"
          initial={{ opacity: 0.95 }}
          animate={animated ? { 
            opacity: [0.95, 1, 0.95]
          } : undefined}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Inner border detail */}
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="4"
          fill="none"
          stroke="#78350f"
          strokeWidth="1.5"
          opacity="0.7"
        />
        
        {/* Corner accents - golden - top left */}
        <path d="M12 28 L12 12 L28 12" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Corner accents - top right */}
        <path d="M72 12 L88 12 L88 28" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Corner accents - bottom left */}
        <path d="M12 72 L12 88 L28 88" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Corner accents - bottom right */}
        <path d="M72 88 L88 88 L88 72" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Question mark - golden mystery box style */}
        <motion.g
          initial={{ y: 0, opacity: 1 }}
          animate={animated ? { 
            y: [0, -3, 0],
            opacity: [1, 0.9, 1]
          } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Question mark curve */}
          <motion.path
            d="M38 38 Q38 26 50 26 Q62 26 62 38 Q62 48 50 52 L50 58"
            stroke="url(#questionGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            style={{
              filter: 'drop-shadow(0 0 6px #fbbf24)'
            }}
            initial={{ pathLength: 1 }}
            animate={animated ? {
              filter: ['drop-shadow(0 0 6px #fbbf24)', 'drop-shadow(0 0 16px #f59e0b)', 'drop-shadow(0 0 6px #fbbf24)']
            } : undefined}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Question mark dot */}
          <motion.circle 
            cx="50" 
            cy="72" 
            r="5" 
            fill="url(#dotGradient)"
            style={{
              filter: 'drop-shadow(0 0 4px #fbbf24)'
            }}
            initial={{ scale: 1 }}
            animate={animated ? { 
              scale: [1, 1.15, 1],
              opacity: [1, 0.85, 1]
            } : undefined}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
        
        {/* Inner golden glow effect */}
        <motion.circle
          cx="50"
          cy="50"
          r={28}
          fill="url(#innerGlow)"
          opacity="0.2"
          initial={{ opacity: 0.25, r: 28 }}
          animate={animated ? { 
            opacity: [0.25, 0.5, 0.25],
            r: [28, 36, 28]
          } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="50%" stopColor="#0c0a09" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          
          <linearGradient id="questionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          
          <radialGradient id="dotGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#fbbf24" />
          </radialGradient>
          
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Background golden glow effect */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-amber-400/50 blur-2xl -z-10"
          animate={{ 
            opacity: [0.5, 0.85, 0.5],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}

// Alternative: Aether Eye logo
export function LogoAetherEye({ size = 'md', animated = true, className }: LogoProps) {
  return (
    <motion.div
      className={cn('relative', sizeStyles[size], className)}
      initial={false}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer ring - portal edge */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#eyeOuterGradient)"
          strokeWidth="3"
          fill="none"
          initial={{ opacity: 0.7 }}
          animate={animated ? { 
            opacity: [0.7, 1, 0.7],
            strokeWidth: [3, 4, 3]
          } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Middle ring - energy ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          stroke="url(#eyeMiddleGradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8 4"
          initial={{ rotate: 0 }}
          animate={animated ? { rotate: 360 } : undefined}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Inner glow circle - the eye/core */}
        <motion.circle
          cx="50"
          cy="50"
          r={22}
          fill="url(#eyeCoreGradient)"
          initial={{ opacity: 0.9, r: 22 }}
          animate={animated ? { 
            opacity: [0.9, 1, 0.9],
            r: [22, 24, 22]
          } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* The pupil / void center */}
        <circle
          cx="50"
          cy="50"
          r="12"
          fill="#0a0a0a"
        />
        
        {/* Inner eye shine */}
        <motion.circle
          cx="50"
          cy="50"
          r="8"
          fill="url(#eyeInnerGradient)"
          initial={{ opacity: 0.8 }}
          animate={animated ? { 
            opacity: [0.8, 1, 0.8]
          } : undefined}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Vertical slit - zombie eye style */}
        <motion.ellipse
          cx="50"
          cy="50"
          rx="3"
          ry="14"
          fill="#b91c1c"
          initial={{ scaleY: 1 }}
          animate={animated ? { 
            scaleY: [1, 0.85, 1],
            opacity: [1, 0.9, 1]
          } : undefined}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Highlight dot */}
        <circle
          cx="44"
          cy="44"
          r="3"
          fill="rgba(255,255,255,0.3)"
        />
        
        {/* Crack lines emanating from center */}
        <g stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
          <line x1="50" y1="28" x2="50" y2="18" />
          <line x1="50" y1="72" x2="50" y2="82" />
          <line x1="28" y1="50" x2="18" y2="50" />
          <line x1="72" y1="50" x2="82" y2="50" />
          <line x1="35" y1="35" x2="26" y2="26" />
          <line x1="65" y1="35" x2="74" y2="26" />
          <line x1="35" y1="65" x2="26" y2="74" />
          <line x1="65" y1="65" x2="74" y2="74" />
        </g>
        
        {/* Gradients */}
        <defs>
          <radialGradient id="eyeOuterGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
          
          <radialGradient id="eyeMiddleGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>
          
          <radialGradient id="eyeCoreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="70%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
          
          <radialGradient id="eyeInnerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Glow effect behind */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full bg-blood-600/30 blur-xl -z-10"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}

// Alternative: Element 115 Crystal logo
export function Logo115({ size = 'md', animated = true, className }: LogoProps) {
  return (
    <motion.div
      className={cn('relative', sizeStyles[size], className)}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Crystal shape */}
        <motion.path
          d="M50 5 L85 35 L85 65 L50 95 L15 65 L15 35 Z"
          fill="url(#crystal115Gradient)"
          stroke="#b91c1c"
          strokeWidth="2"
          initial={{ opacity: 0.9 }}
          animate={animated ? { 
            opacity: [0.9, 1, 0.9]
          } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Inner facet lines */}
        <g stroke="#dc2626" strokeWidth="1" opacity="0.5">
          <line x1="50" y1="5" x2="50" y2="95" />
          <line x1="15" y1="35" x2="85" y2="65" />
          <line x1="85" y1="35" x2="15" y2="65" />
          <line x1="50" y1="5" x2="15" y2="65" />
          <line x1="50" y1="5" x2="85" y2="65" />
          <line x1="50" y1="95" x2="15" y2="35" />
          <line x1="50" y1="95" x2="85" y2="35" />
        </g>
        
        {/* 115 text */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="24"
          fontWeight="bold"
          fontFamily="monospace"
        >
          115
        </text>
        
        <defs>
          <linearGradient id="crystal115Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#262626" />
            <stop offset="50%" stopColor="#171717" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Glow */}
      {animated && (
        <motion.div
          className="absolute inset-0 bg-blood-600/20 blur-xl -z-10"
          animate={{ 
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
