import type { FC, ChangeEvent, ReactNode } from "react";
import { UploadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

interface Props {
  label: string;
  name: string;
  icon: ReactNode;
  fileName: string | null | undefined;
  accept: string;
  description: string;
  error?: string;
  touched?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export const FileUploadField: FC<Props> = ({
  label,
  name,
  icon,
  fileName,
  accept,
  description,
  error,
  touched,
  onChange,
  required = true, // Default required to true
}) => {
  const showError = touched && error;
  const inputId = `file-upload-${name}`;

  return (
    <div>
      <label
        htmlFor={inputId} // Associate label with the input for accessibility
        style={{
          display: "block",
          marginBottom: 4,
          color: "#3b82f6",
          fontWeight: 500,
        }}
      >
        {label} {required && "*"}
      </label>
      <label
        // This label acts as the visual trigger for the hidden input
        style={{
          display: "block",
          padding: "16px 8px", // Increased padding for better touch target
          border: `2px dashed ${showError ? "#ef4444" : "#d1d5db"}`, // Dashed border
          borderRadius: 6,
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: "#f9fafb", // Light background
          transition: "background-color 0.2s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
      >
        {icon || <UploadOutlined style={{ fontSize: 24, color: "#6b7280" }} />}
        <p
          style={{
            margin: "8px 0 4px",
            fontWeight: 500,
            color: fileName ? "#1f2937" : "#6b7280", // Darker text if file selected
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap", // Prevent wrapping
          }}
        >
          {fileName || `Click to upload ${label.toLowerCase()}`}
        </p>
        <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
          {description}
        </p>
        <input
          id={inputId}
          name={name} // Add name attribute for potential form handling
          type="file"
          accept={accept}
          onChange={onChange}
          style={{ display: "none" }} // Keep the actual input hidden
        />
      </label>
      {showError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
            color: "#ef4444",
            fontSize: 12,
          }}
        >
          <ExclamationCircleOutlined />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
