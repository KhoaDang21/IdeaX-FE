export const getFundingRangeDisplay = (fundingRange: string): string => {
  const rangeMap: { [key: string]: string } = {
    UNDER_50K: "UNDER $50K",
    FROM_50K_TO_200K: "$50K - $200K",
    FROM_200K_TO_1M: "$200K - $1M",
    OVER_1M: "Over $1M",
  };
  return rangeMap[fundingRange] || "Not specified";
};

export const getCategoryStyle = (category: string) => {
  const colors = [
    { background: "#dbeafe", color: "#1e40af" }, // Blue
    { background: "#dcfce7", color: "#16a34a" }, // Green
    { background: "#fef3c7", color: "#92400e" }, // Yellow
    { background: "#e9d5ff", color: "#581c87" }, // Purple
    { background: "#cffafe", color: "#0e7490" }, // Cyan
    { background: "#fce7f3", color: "#9d174d" }, // Pink
    { background: "#ffedd5", color: "#c2410c" }, // Orange
    { background: "#fee2e2", color: "#ef4444" }, // Red
  ];

  const index =
    Math.abs(category.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
    colors.length;

  return colors[index];
};