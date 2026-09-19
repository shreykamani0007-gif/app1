/**
 * Utility helper functions
 */

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
