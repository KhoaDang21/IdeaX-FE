import type { FC } from "react";
import { Button, Progress, Tooltip, Tag } from "antd";
import { CrownOutlined, PlusOutlined } from "@ant-design/icons";

interface Props {
  onNewProject: () => void;
  onBuyMore: () => void;
  currentCount: number;
  maxLimit: number;
}

export const ProjectPageHeader: FC<Props> = ({
  onNewProject,
  onBuyMore,
  currentCount,
  maxLimit,
}) => {
  // Tính phần trăm sử dụng (không vượt quá 100%)
  const usagePercent = Math.min(
    Math.round((currentCount / maxLimit) * 100),
    100
  );
  const isLimitReached = currentCount >= maxLimit;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        background: "#fff",
        borderRadius: 12,
        marginBottom: 24,
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* Bên trái: Tiêu đề & Mô tả */}
      <div style={{ flex: 1, minWidth: "200px" }}>
        <h3
          style={{
            margin: 0,
            color: "#1e3a8a",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Project Status
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
          Track your project progress and manage milestones
        </p>
      </div>

      {/* Bên phải: Thống kê & Nút bấm */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Hiển thị thanh tiến độ giới hạn */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 13, color: "#4b5563", fontWeight: 500 }}>
              Usage:
            </span>
            <Tag color={isLimitReached ? "red" : "blue"} style={{ margin: 0 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                {currentCount}
              </span>
              <span style={{ opacity: 0.6 }}> / {maxLimit}</span>
            </Tag>
          </div>
          <Tooltip title={`${usagePercent}% of your project limit used`}>
            <Progress
              percent={usagePercent}
              size="small"
              style={{ width: 140, margin: 0 }}
              showInfo={false}
              status={isLimitReached ? "exception" : "active"}
              strokeColor={isLimitReached ? "#ef4444" : "#3b82f6"}
            />
          </Tooltip>
        </div>

        {/* Nhóm nút hành động */}
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            icon={<CrownOutlined />}
            onClick={onBuyMore}
            style={{
              borderColor: "#eab308",
              color: "#b45309",
              background: "#fefce8",
              fontWeight: 500,
            }}
          >
            Buy Slots
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onNewProject}
            disabled={isLimitReached}
            style={{
              background: isLimitReached ? "#9ca3af" : "#38bdf8",
              borderColor: isLimitReached ? "#9ca3af" : "#38bdf8",
              fontWeight: 500,
            }}
          >
            New Project
          </Button>
        </div>
      </div>
    </div>
  );
};
