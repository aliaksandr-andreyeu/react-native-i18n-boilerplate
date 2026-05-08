export const rgba = (color: string, alpha?: number): string => {
  if (!color) {
    throw new Error('Color is required.');
  }
  const hex = color.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const a = alpha !== undefined && alpha >= 0 && alpha <= 100 ? alpha / (alpha ? 100 : 1) : 1;
  const rgbaColor = [r, g, b, a].join(',');
  return `rgba(${rgbaColor})`;
};
