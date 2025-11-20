import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

interface SignatureCardProps {
  label: string;
  personName: string;
  signatureHtml?: string | null;
  signedAtText?: string;
  placeholder?: string;
  minHeight?: number;
}

const SignatureCard: React.FC<SignatureCardProps> = ({
  label,
  personName,
  signatureHtml,
  signedAtText,
  placeholder = "Ký và ghi rõ họ tên",
  minHeight = 120,
}) => (
  <div style={{ flex: 1 }}>
    <Text strong style={{ fontSize: 14, display: "block", marginBottom: 12 }}>
      {label}
    </Text>
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 4,
        padding: 16,
        background: "#fff",
        minHeight,
      }}
    >
      {signatureHtml ? (
        <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
      ) : (
        <div style={{ textAlign: "center" }}>
          {signedAtText && (
            <div style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>
              {signedAtText}
            </div>
          )}
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 12 }}>
            {personName}
          </div>
          <div
            style={{
              borderTop: "1px solid #000",
              paddingTop: 8,
              fontSize: 12,
              color: "#666",
            }}
          >
            {placeholder}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default SignatureCard;

