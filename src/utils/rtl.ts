/**
 * RTL (Right-to-Left) utility functions for Arabic layout support
 */

export const rtlUtils = {
  /**
   * Returns appropriate margin classes for RTL layout
   */
  marginRight: (size: string) => `ml-${size}`,
  marginLeft: (size: string) => `mr-${size}`,
  
  /**
   * Returns appropriate padding classes for RTL layout
   */
  paddingRight: (size: string) => `pl-${size}`,
  paddingLeft: (size: string) => `pr-${size}`,
  
  /**
   * Returns appropriate border classes for RTL layout
   */
  borderRight: (size: string) => `border-l-${size}`,
  borderLeft: (size: string) => `border-r-${size}`,
  
  /**
   * Returns appropriate positioning classes for RTL layout
   */
  right: (size: string) => `left-${size}`,
  left: (size: string) => `right-${size}`,
  
  /**
   * Returns appropriate text alignment classes for RTL
   */
  textAlign: {
    right: 'text-right',
    left: 'text-left',
    center: 'text-center',
  },
  
  /**
   * Returns appropriate flex direction for RTL
   */
  flexDirection: {
    row: 'flex-row-reverse',
    rowReverse: 'flex-row',
    col: 'flex-col',
    colReverse: 'flex-col-reverse',
  },
  
  /**
   * Returns appropriate gradient directions for RTL
   */
  gradient: {
    toRight: 'bg-gradient-to-l',
    toLeft: 'bg-gradient-to-r',
    toTopRight: 'bg-gradient-to-bl',
    toTopLeft: 'bg-gradient-to-br',
    toBottomRight: 'bg-gradient-to-tl',
    toBottomLeft: 'bg-gradient-to-tr',
  },
  
  /**
   * Returns appropriate transform classes for RTL
   */
  transform: {
    translateX: (value: number) => `translate-x-${-value}`,
    scaleX: (value: number) => value < 0 ? `scale-x-${Math.abs(value)}` : `-scale-x-${value}`,
  },
  
  /**
   * Returns appropriate animation directions for RTL
   */
  animation: {
    slideInFromRight: 'animate-slide-in-right',
    slideOutToRight: 'animate-slide-out-right',
  },
  
  /**
   * Helper function to determine if element should be reversed in RTL
   */
  shouldReverse: (element: 'icon' | 'arrow' | 'chevron' | 'caret') => {
    const reverseElements = ['arrow', 'chevron', 'caret'];
    return reverseElements.includes(element);
  },
  
  /**
   * Returns appropriate space-between classes for RTL
   */
  spaceX: (size: string) => `space-x-${size} space-x-reverse`,
  
  /**
   * Returns appropriate divide classes for RTL
   */
  divideX: (size: string) => `divide-x-${size} divide-x-reverse`,
};

/**
 * Custom hook for RTL-aware component styling
 */
export const useRTL = () => {
  const isRTL = document.documentElement.dir === 'rtl';
  
  return {
    isRTL,
    dir: isRTL ? 'rtl' : 'ltr',
    utils: rtlUtils,
    
    /**
     * Conditionally apply RTL-specific classes
     */
    conditional: (rtlClasses: string, ltrClasses: string = '') => 
      isRTL ? rtlClasses : ltrClasses,
    
    /**
     * Get appropriate icon rotation for RTL
     */
    getIconRotation: (baseRotation: number = 0) => 
      isRTL ? baseRotation + 180 : baseRotation,
  };
};

/**
 * Utility to create RTL-aware className strings
 */
export const rtlClass = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Convert LTR Tailwind classes to RTL equivalents
 */
export const convertToRTL = (className: string): string => {
  return className
    .replace(/\bml-/g, 'mr-')
    .replace(/\bmr-/g, 'ml-')
    .replace(/\bpl-/g, 'pr-')
    .replace(/\bpr-/g, 'pl-')
    .replace(/\bborder-l-/g, 'border-r-')
    .replace(/\bborder-r-/g, 'border-l-')
    .replace(/\bleft-/g, 'right-')
    .replace(/\bright-/g, 'left-')
    .replace(/\brounded-l-/g, 'rounded-r-')
    .replace(/\brounded-r-/g, 'rounded-l-')
    .replace(/\bg-gradient-to-r\b/g, 'bg-gradient-to-l')
    .replace(/\bg-gradient-to-l\b/g, 'bg-gradient-to-r')
    .replace(/\bg-gradient-to-tr\b/g, 'bg-gradient-to-tl')
    .replace(/\bg-gradient-to-tl\b/g, 'bg-gradient-to-tr')
    .replace(/\bg-gradient-to-br\b/g, 'bg-gradient-to-bl')
    .replace(/\bg-gradient-to-bl\b/g, 'bg-gradient-to-br');
};

export default rtlUtils;
