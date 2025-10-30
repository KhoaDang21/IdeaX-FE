import type { FC } from "react";
import { SafetyCertificateOutlined } from "@ant-design/icons";

export const PrivacyLegalSection: FC = () => {
  return (
    <div
      style={{
        padding: "16px", // Consistent padding
        border: "1px solid #e5e7eb", // Consistent border
        borderRadius: 8, // Consistent radius
        marginTop: 24,
        background: "#ffffff", // Consistent background
      }}
    >
      <h3
        style={{
          margin: "0 0 16px", // Adjusted margin
          color: "#3b82f6",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "1.1rem", // Consistent heading size
        }}
      >
        <SafetyCertificateOutlined style={{ color: "#000" }} /> Privacy & Legal
        Settings
      </h3>
      {/* Add placeholder text or actual content here */}
      <p style={{ color: "#64748b", fontSize: 14 }}>
        Settings related to project privacy and legal terms will appear here.
        (Currently under development)
      </p>
    </div>
  );
};
