// Разбивка числа на разряды по локали ru-RU: 1234567 -> "1 234 567".
const priceFormatter = new Intl.NumberFormat("ru-RU");

export function formatPrice(price) {
  return priceFormatter.format(Number(price));
}
