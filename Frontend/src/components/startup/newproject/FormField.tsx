import type { FC, ChangeEvent, FocusEvent, ReactNode } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface Props {
  label: string;
  icon?: ReactNode;
  name: string;
  value: string | number;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onBlur: (
    e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  type?: string;
  options?: Array<{ value: string; label: string }>;
  isTextArea?: boolean;
  maxLength?: number;
  required?: boolean;
}

export const FormField: FC<Props> = ({
  label,
  icon,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  type = "text",
  options,
  isTextArea = false,
  maxLength,
  required = true, // Default required to true based on original form
}) => {
  const showError = touched && error;
  const inputId = `form-field-${name}`;

  const commonStyles = {
    width: "100%",
    padding: 8,
    border: `1px solid ${showError ? "#ef4444" : "#d1d5db"}`,
    borderRadius: 6,
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
          color: "#3b82f6",
          fontWeight: 500, // Make labels slightly bolder
        }}
      >
        {icon || <span style={{ width: 14 }}></span>}{" "}
        {/* Add placeholder if no icon */}
        {label} {required && "*"}
      </label>
      {isTextArea ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            ...commonStyles,
            minHeight: 100,
            resize: "vertical", // Allow vertical resize
          }}
        />
      ) : options ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          style={{
            ...commonStyles,
            background: "#f3f4f6", // Style for selects
            appearance: "none", // Basic style reset
          }}
        >
          <option value="">
            {placeholder || `Select ${label.toLowerCase()}`}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          min={type === "number" ? "1" : undefined}
          max={type === "number" ? "1000" : undefined}
          style={commonStyles}
        />
      )}
      {/* Moved description/error block outside input */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 4,
          minHeight: "18px", // Reserve space for error/description
        }}
      >
        {showError ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "#ef4444",
              fontSize: 12,
            }}
          >
            <ExclamationCircleOutlined />
            <span>{error}</span>
          </div>
        ) : isTextArea && maxLength ? (
          <div style={{ color: "#64748b", fontSize: 12 }}>
            {String(value).trim().length}/{maxLength} characters
            {String(value).trim().length < 10 && " (min 10 required)"}
          </div>
        ) : (
          <div></div> // Empty div to maintain spacing
        )}
        {isTextArea && !showError && (
          <div style={{ color: "#64748b", fontSize: 12 }}>
            Minimum 10 characters required
          </div>
        )}
      </div>
    </div>
  );
};
