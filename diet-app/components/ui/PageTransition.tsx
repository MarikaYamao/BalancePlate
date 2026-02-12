'use client';

import { ReactNode } from 'react';
import { usePageTransition, useReducedMotion } from '@/lib/hooks/usePageTransition';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const { isTransitioning } = usePageTransition();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`${className} transition-all duration-300 ease-out ${
        isTransitioning 
          ? 'opacity-0 translate-y-2' 
          : 'opacity-100 translate-y-0'
      }`}
    >
      {children}
    </div>
  );
}

export function FadeIn({ 
  children, 
  delay = 0,
  duration = 500,
  className = '' 
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`${className} animate-fadeIn`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function SlideIn({ 
  children, 
  from = 'bottom',
  delay = 0,
  className = '' 
}: {
  children: ReactNode;
  from?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const animationClass = {
    left: 'animate-slideInLeft',
    right: 'animate-slideInRight',
    top: 'animate-slideInTop',
    bottom: 'animate-slideInBottom',
  }[from];

  return (
    <div
      className={`${className} ${animationClass}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Stagger({ 
  children, 
  delay = 100,
  className = '' 
}: {
  children: ReactNode[];
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * delay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}