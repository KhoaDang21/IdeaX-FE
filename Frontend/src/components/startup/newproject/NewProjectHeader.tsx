import type { FC } from "react";

interface Props {
  submitting: boolean;
  onCreate: (status: string) => void;
  onBack: () => void;
  isLastStep: boolean; // **MỚI**: Thêm prop này
}

export const NewProjectHeader: FC<Props> = ({
  submitting,
  onCreate,
  onBack,
  isLastStep, // **MỚI**: Nhận prop
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <h2 style={{ margin: 0, color: "#3b82f6" }}>Submit New Project</h2>
      <div>
        {/* **MỚI**: Chỉ render nút Submit ở bước cuối */}
        {isLastStep && (
          <button
            onClick={() => onCreate("DRAFT")} // Giả sử "DRAFT" là trạng thái mặc định
            disabled={submitting}
            style={{
              marginRight: 8,
              padding: "6px 12px",
              background: submitting ? "#94a3b8" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Creating..." : "Submit"}
          </button>
        )}
        <button
          onClick={onBack}
          disabled={submitting} // Vẫn vô hiệu hóa khi đang gửi
          style={{
            padding: "6px 12px",
            background: "#6b7280",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          Back to Projects
        </button>
      </div>
    </div>
  );
};
