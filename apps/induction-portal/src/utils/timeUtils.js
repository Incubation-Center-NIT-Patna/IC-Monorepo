/*
 Calculates the relative time difference between a given timestamp and the current time,
 displaying it dynamically in minutes, hours, or days.
 */
export function formatTimeAgo(timestampString) {
  if (!timestampString) return 'Just now';

  const createdTime = new Date(timestampString);
  const currentTime = new Date();

  const differenceInMs = currentTime - createdTime;

  // If the log is somehow set in the future due to clock sync discrepancies
  if (differenceInMs < 0) return 'Just now';

  // Time conversion metrics
  const minutes = Math.floor(differenceInMs / (1000 * 60));
  const hours = Math.floor(differenceInMs / (1000 * 60 * 60));
  const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

  // 1. If it's less than 1 hour ago (0 to 59 minutes)
  if (hours < 1) {
    if (minutes <= 0) return 'Just now';
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }

  // 2. If it's less than 24 hours ago (1 to 23 hours)
  if (days < 1) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // 3. If it's 24 hours or older (1+ days)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}