import type { FC } from "react";

interface Props {
  submitting: boolean;
  onCreate: (status: string) => void;
  onBack: () => void;
}

export const NewProjectHeader: FC<Props> = ({
  submitting,
  onCreate,
  onBack,
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
        <button
          onClick={() => onCreate("DRAFT")} // Assuming "DRAFT" is the default submit status
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
        <button
          onClick={onBack}
          disabled={submitting} // Disable back button while submitting too
          style={{
            padding: "6px 12px",
            background: "#6b7280", // Changed color slightly
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
