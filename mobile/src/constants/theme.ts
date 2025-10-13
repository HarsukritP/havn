// Havn Design Tokens - Based on docs/design.md

export const colors = {
  // Brand
  primary: {
    500: '#2563EB',
    600: '#1D4ED8',
    400: '#3B82F6',
  },
  
  // Availability Status
  success: {
    500: '#10B981',
  },
  warning: {
    500: '#F59E0B',
  },
  error: {
    500: '#EF4444',
  },
  
  // Neutrals
  dark: {
    900: '#1F2937',
  },
  gray: {
    600: '#6B7280',
  },
  light: {
    100: '#F3F4F6',
    200: '#E5E7EB',
  },
  white: '#FFFFFF',
};

// 4px-based spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

// Border radius scale
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadow system
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};

// Typography scale
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
};

// Availability status helpers
export const getAvailabilityColor = (status: string) => {
  switch (status) {
    case 'available':
      return colors.success[500];
    case 'low':
      return colors.warning[500];
    case 'full':
      return colors.error[500];
    default:
      return colors.gray[600];
  }
};

export const getAvailabilityStatus = (available: number, total: number): string => {
  const percent = (available / total) * 100;
  if (percent > 50) return 'available';
  if (percent > 20) return 'low';
  return 'full';
};

