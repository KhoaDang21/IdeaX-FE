import type { FC } from "react";
import { Popconfirm, Tooltip, Progress } from "antd"; // Đã thêm Progress
import { DeleteOutlined } from "@ant-design/icons";
import type { ProjectUI } from "../../../interfaces/startup/myprojects";

// Helpers được di chuyển vào đây vì chúng chỉ thuộc về component này
const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return { background: "#dcfce7", color: "#16a34a" };
    case "DRAFT":
      return { background: "#fef3c7", color: "#92400e" };
    case "PUBLISHED":
      return { background: "#dbeafe", color: "#1e40af" };
    case "REJECTED":
      return { background: "#fee2e2", color: "#ef4444" };
    case "COMPLETE":
      return { background: "#e0f2fe", color: "#0284c7" };
    default:
      return { background: "#e5e7eb", color: "#6b7280" };
  }
};

const getStatusText = (status: string): string => {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "In Deal";
    case "DRAFT":
      return "Waiting for Review";
    case "PUBLISHED":
      return "Ongoing";
    case "REJECTED":
      return "Rejected";
    case "COMPLETE":
      return "Completed";
    default:
      return status;
  }
};

interface Props {
  project: ProjectUI;
  isSelected: boolean;
  isDeleting: boolean;
  isDeletionDisallowed: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

export const ProjectCard: FC<Props> = ({
  project,
  isSelected,
  isDeleting,
  isDeletionDisallowed,
  onSelect,
  onDelete,
  onViewDetails,
}) => {
  const statusStyle = getStatusColor(project.status);

  return (
    <div
      key={project.id}
      onClick={() => !isDeleting && onSelect(project.id)}
      style={{
        flex: "0 0 300px",
        minWidth: 300,
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: isSelected ? "2px solid #3b82f6" : "2px solid transparent",
        cursor: isDeleting ? "not-allowed" : "pointer",
        opacity: isDeleting ? 0.6 : 1,
        transition: "all 0.2s ease",
      }}
    >
      {/* Header: Title & Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16 }}>{project.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              background: statusStyle.background,
              color: statusStyle.color,
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            {getStatusText(project.status)}
          </span>
          {isDeletionDisallowed ? (
            <Tooltip title="Liên hệ quản lí để xóa">
              <span>
                <DeleteOutlined
                  style={{ color: "#d1d5db", cursor: "not-allowed" }}
                />
              </span>
            </Tooltip>
          ) : (
            <Popconfirm
              title="Are you sure you want to delete this project?"
              onConfirm={(e) => {
                e?.stopPropagation(); // Ngăn không cho card được chọn
                onDelete(project.id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Yes"
              cancelText="No"
              disabled={isDeleting}
            >
              <DeleteOutlined
                onClick={(e) => e.stopPropagation()} // Ngăn không cho card được chọn
                style={{
                  color: isDeleting ? "#d1d5db" : "#ef4444",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                }}
              />
            </Popconfirm>
          )}
        </div>
      </div>

      {/* Target Info */}
      <p style={{ margin: "12px 0 4px", fontSize: 12, color: "#64748b" }}>
        Target:{" "}
        <span style={{ color: "#1e293b", fontWeight: 500 }}>
          {project.target}
        </span>
      </p>

      {/* Raised Info & Progress Bar */}
      <div style={{ marginBottom: 8 }}>
        {/* 👇 SỬA DÒNG NÀY: Đổi space-between thành flex-start và thêm gap */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "4px",
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          <span style={{ color: "#64748b" }}>Raised:</span>
          <span style={{ fontWeight: 600, color: "#10b981" }}>
            {project.raised}
          </span>
        </div>
        <Progress
          percent={project.progress}
          showInfo={false}
          size="small"
          strokeColor="#3b82f6"
          trailColor="#e5e7eb"
        />
      </div>

      {/* Stage Info */}
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
        Stage: {project.stage}
      </p>

      {/* Footer: Investors & Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
          {project.metrics.activeInvestors} investors
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(project.id);
          }}
          style={{
            color: "#3b82f6",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            background: "#eff6ff",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#eff6ff")}
        >
          View Details
        </button>
      </div>
    </div>
  );
};
