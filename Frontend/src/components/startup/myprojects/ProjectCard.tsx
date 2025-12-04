import type { FC } from "react";
import { Popconfirm, Tooltip, Progress } from "antd";
import { DeleteOutlined, DollarCircleOutlined } from "@ant-design/icons";
import type { ProjectUI } from "../../../interfaces/startup/myprojects";

// Helpers
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
  project: ProjectUI & { fundingRangeDisplay?: string };
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

  // Kiểm tra đã ký hợp đồng chưa (APPROVED hoặc COMPLETE)
  const isContractSigned = ["APPROVED", "COMPLETE"].includes(
    project.status.toUpperCase()
  );

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header: Title & Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={project.title}
        >
          {project.title}
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              background: statusStyle.background,
              color: statusStyle.color,
              padding: "2px 8px",
              borderRadius: 999,
              whiteSpace: "nowrap",
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
                e?.stopPropagation();
                onDelete(project.id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Yes"
              cancelText="No"
              disabled={isDeleting}
            >
              <DeleteOutlined
                onClick={(e) => e.stopPropagation()}
                style={{
                  color: isDeleting ? "#d1d5db" : "#ef4444",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                }}
              />
            </Popconfirm>
          )}
        </div>
      </div>

      {/* --- PHẦN TÀI CHÍNH (Updated) --- */}
      <div style={{ minHeight: 60, marginBottom: 8 }}>
        {isContractSigned ? (
          // 1. Đã ký hợp đồng: Hiện Target, Raised, Progress kèm %
          <>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
              Target:{" "}
              <span style={{ color: "#1e293b", fontWeight: 500 }}>
                {project.target}
              </span>
            </p>
            <div style={{ marginBottom: 4 }}>
              {/* Flex space-between để Raised và % nằm 2 đầu */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", gap: "4px" }}>
                  <span style={{ color: "#64748b" }}>Raised:</span>
                  <span style={{ fontWeight: 600, color: "#10b981" }}>
                    {project.raised}
                  </span>
                </div>
                {/* Hiển thị số % */}
                <span
                  style={{ fontWeight: 600, color: "#3b82f6", fontSize: 11 }}
                >
                  {project.progress}%
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
          </>
        ) : (
          // 2. Chưa ký hợp đồng: Hiện Funding Range
          <div
            style={{
              background: "#f8fafc",
              padding: "10px",
              borderRadius: "8px",
              border: "1px dashed #cbd5e1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Estimated Range
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <DollarCircleOutlined style={{ color: "#64748b" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>
                {project.fundingRangeDisplay || "Not specified"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stage Info */}
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b", flex: 1 }}>
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
