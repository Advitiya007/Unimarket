export const CATEGORIES = [
  { name: 'Books', icon: '📚', bg: 'bg-campus-blue-50', color: 'text-campus-blue-500' },
  { name: 'Electronics', icon: '💻', bg: 'bg-campus-emerald-50', color: 'text-campus-emerald-500' },
  { name: 'Cycles', icon: '🚲', bg: 'bg-campus-orange-50', color: 'text-campus-orange-500' },
  { name: 'Furniture', icon: '🪑', bg: 'bg-campus-blue-50', color: 'text-campus-blue-500' },
  { name: 'Hostel Essentials', icon: '🧺', bg: 'bg-campus-emerald-50', color: 'text-campus-emerald-500' },
  { name: 'Lab Equipment', icon: '🧪', bg: 'bg-campus-orange-50', color: 'text-campus-orange-500' },
  { name: 'Sports', icon: '🏸', bg: 'bg-campus-blue-50', color: 'text-campus-blue-500' },
  { name: 'Stationery', icon: '✏️', bg: 'bg-campus-emerald-50', color: 'text-campus-emerald-500' },
  { name: 'Clothing', icon: '👕', bg: 'bg-campus-orange-50', color: 'text-campus-orange-500' },
  { name: 'Lost & Found', icon: '🔍', bg: 'bg-campus-blue-50', color: 'text-campus-blue-500' },
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Used'];

export const MEETUP_LOCATIONS = [
  'Boys Hostel',
  'Girls Hostel',
  'Mega Canteen',
  'Central Library',
  'Academic Block',
  'Main Gate',
  'SAC',
  'Sports Complex',
  'Other',
];

export const timeAgo = (dateString) => {
  const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
};
