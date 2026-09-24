export const USD_TO_INR = 84;

export function formatINR(usdPrice) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(usdPrice || 0) * USD_TO_INR);
}

export function inrToApiPrice(inrPrice) {
  return Number(inrPrice || 0) / USD_TO_INR;
}

export function apiPriceToInr(usdPrice) {
  return Math.round(Number(usdPrice || 0) * USD_TO_INR);
}
