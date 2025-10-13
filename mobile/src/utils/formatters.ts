import { formatDistanceToNow } from 'date-fns';

// Format timestamp to "3 min ago"
export const formatTimeAgo = (timestamp: string | Date): string => {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

// Format distance in meters to readable format
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// Format walking time estimate (assuming 5 km/h)
export const formatWalkingTime = (meters: number): string => {
  const minutes = Math.round((meters / 1000) * 12); // 12 min per km
  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
};

// Obscure name for privacy ("John Smith" → "John S.")
export const obscureName = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return fullName;
  
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstName} ${lastInitial}.`;
};

// Format points with thousands separator
export const formatPoints = (points: number): string => {
  return points.toLocaleString();
};

