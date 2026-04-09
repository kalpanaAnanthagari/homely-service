/**
 * Formats amounts stored in minor units (paise). DB fields named `*Cents` use the
 * same numeric convention: 100 units = 1 rupee.
 */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
