export const formatDate = (value: string) =>
  new Date(value.length === 10 ? `${value}T00:00:00Z` : value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export const formatMoney = (amount: number) => `Rs. ${amount.toLocaleString("en-IN")}`;