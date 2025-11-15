// Mapping từ display names sang enum values cho backend
// Backend enums accept display names qua @JsonCreator nhưng để an toàn, gửi enum name

export const CATEGORY_OPTIONS = [
  { label: "Fintech", value: "FINTECH" },
  { label: "Healthcare", value: "HEALTHCARE" },
  { label: "Education", value: "EDUCATION" },
  { label: "Ecommerce", value: "ECOMMERCE" },
  { label: "AI", value: "AI" },
  { label: "Blockchain", value: "BLOCKCHAIN" },
  { label: "Green Tech", value: "GREEN_TECH" },
  { label: "Agriculture", value: "AGRICULTURE" },
  { label: "Other", value: "OTHER" },
];

export const FUNDING_RANGE_OPTIONS = [
  { label: "Under 50K", value: "UNDER_50K" },
  { label: "50K to 200K", value: "FROM_50K_TO_200K" },
  { label: "200K to 1M", value: "FROM_200K_TO_1M" },
  { label: "Over 1M", value: "OVER_1M" },
];

export const INVESTMENT_EXPERIENCE_OPTIONS = [
  { label: "No Experience", value: "NO_EXPERIENCE" },
  { label: "Less than 1 Year", value: "LESS_THAN_1_YEAR" },
  { label: "1 to 3 Years", value: "ONE_TO_3_YEARS" },
  { label: "3 to 5 Years", value: "THREE_TO_5_YEARS" },
  { label: "More than 5 Years", value: "MORE_THAN_5_YEARS" },
];
