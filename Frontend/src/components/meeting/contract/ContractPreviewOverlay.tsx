import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Button, Typography } from "antd";

const { Text, Title } = Typography;

interface ContractPreviewOverlayProps {
  open: boolean;
  contractHtml: string;
  investorSignatureHtml?: string | null;
  investorName: string;
  investorSignedAt?: string | null;
  onClose: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(15,23,42,0.65)",
  zIndex: 1100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const panelStyle: React.CSSProperties = {
  width: "min(1000px, 96vw)",
  maxHeight: "90vh",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 25px 65px rgba(15,23,42,0.45)",
  display: "flex",
  flexDirection: "column",
};

const bodyStyle: React.CSSProperties = {
  flex: 1,
  overflow: "auto",
  padding: "20px 24px",
  background: "#fff",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  padding: "16px 24px",
  borderTop: "1px solid #f0f0f0",
  background: "#fff",
  borderBottomLeftRadius: 12,
  borderBottomRightRadius: 12,
};

const headerStyle: React.CSSProperties = {
  padding: "18px 24px 12px",
  borderBottom: "1px solid #f0f0f0",
  background: "#fff",
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
};

const ContractPreviewOverlay: React.FC<ContractPreviewOverlayProps> = ({
  open,
  contractHtml,
  investorSignatureHtml,
  investorName,
  investorSignedAt,
  onClose,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  if (typeof document !== "undefined" && !containerRef.current) {
    containerRef.current = document.createElement("div");
    containerRef.current.className = "meeting-contract-preview-root";
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!open || !el || typeof document === "undefined") {
      return;
    }
    document.body.appendChild(el);
    return () => {
      el.parentElement?.removeChild(el);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  const sanitizedHtml = useMemo(
    () =>
      contractHtml
        ? contractHtml.replace(
            /<div class="signature-grid">[\s\S]*?<\/div>\s*<p class="footer-note">/gi,
            '<p class="footer-note">'
          )
        : "<p>Điền đủ thông tin ở biểu mẫu rồi bấm <strong>Xem trước hợp đồng</strong> để tạo bản nháp.</p>",
    [contractHtml]
  );

  if (!open || !containerRef.current) {
    return null;
  }

  return createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={panelStyle}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div style={headerStyle}>
          <Title level={4} style={{ margin: 0 }}>
            Xem trước hợp đồng
          </Title>
        </div>
        <div style={bodyStyle}>
          <div
            style={{ paddingBottom: 16 }}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
          <div
            style={{
              marginTop: 8,
              borderTop: "1px solid #d9d9d9",
              paddingTop: 20,
            }}
          >
            <Text
              strong
              style={{ fontSize: 14, display: "block", marginBottom: 12 }}
            >
              NHÀ ĐẦU TƯ
            </Text>
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                padding: 16,
                background: "#fff",
                minHeight: 120,
              }}
            >
              {investorSignatureHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: investorSignatureHtml }}
                />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{ color: "#666", fontSize: 12, marginBottom: 8 }}
                  >
                    {investorSignedAt
                      ? `Thời gian: ${investorSignedAt}`
                      : "Ngày ... tháng ... năm 20..."}
                  </div>
                  <div
                    style={{ fontWeight: 500, fontSize: 14, marginBottom: 12 }}
                  >
                    {investorName}
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid #000",
                      paddingTop: 8,
                      fontSize: 12,
                      color: "#666",
                    }}
                  >
                    Ký và ghi rõ họ tên
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={footerStyle}>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>,
    containerRef.current
  );
};

export default ContractPreviewOverlay;

