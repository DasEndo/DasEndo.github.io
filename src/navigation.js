export function nextMenuIndex(current, direction, length) {
  if (!length) return -1;
  if (current < 0) return direction > 0 ? 0 : length - 1;
  return (current + direction + length) % length;
}
