export const generateRandomId = (): string => {
  const date = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${date}-${random}`;
}