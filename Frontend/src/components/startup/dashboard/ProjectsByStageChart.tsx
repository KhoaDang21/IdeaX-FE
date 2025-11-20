import type { FC } from "react";
import { Card, Row, Col, Button, Empty } from "antd";
import { Column } from "@ant-design/charts";
import { PlusOutlined } from "@ant-design/icons";
import type { DashboardStats } from "../../../interfaces/startup/dashboard";

interface Props {
  stats: DashboardStats;
  fundingStageData: any[];
  fundingColumnConfig: any;
}

// 1. Định nghĩa bảng màu cố định để đồng nhất giữa Chart và Legend
const STAGE_COLOR_MAP: Record<string, string> = {
  Idea: "#8B5CF6", // Violet
  Seed: "#3B82F6", // Blue
  "Series A": "#10B981", // Emerald
  "Series B": "#F59E0B", // Amber
  "Series C": "#EF4444", // Red
  IPO: "#6366F1", // Indigo
  // Fallback color
  default: "#9CA3AF",
};

export const ProjectsByStageChart: FC<Props> = ({
  stats,
  fundingStageData,
  fundingColumnConfig,
}) => {
  // 2. Cấu hình lại biểu đồ để đẹp hơn và có Animation
  const refinedConfig = {
    ...fundingColumnConfig,
    data: fundingStageData,
    xField: "stage",
    yField: "count",
    // Màu sắc lấy từ map phía trên
    color: ({ stage }: any) =>
      STAGE_COLOR_MAP[stage] || STAGE_COLOR_MAP.default,
    // Style cho cột: bo góc và độ rộng vừa phải
    columnStyle: {
      radius: [6, 6, 0, 0],
      cursor: "pointer",
    },
    maxColumnWidth: 40,
    // Animation: Hiệu ứng mọc lên
    animation: {
      appear: {
        animation: "scale-in-y",
        duration: 1000,
      },
    },
    // Tooltip tùy chỉnh cho đẹp hơn
    tooltip: {
      showMarkers: false,
      domStyles: {
        "g2-tooltip": {
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "none",
        },
      },
    },
    // Tắt trục lưới ngang nhìn cho thoáng (tùy chọn)
    yAxis: {
      grid: {
        line: {
          style: {
            lineDash: [4, 4],
            stroke: "#e5e7eb",
          },
        },
      },
    },
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>
            Projects by Stage
          </span>
          <span
            style={{
              fontSize: 12,
              backgroundColor: "#f3f4f6",
              padding: "2px 8px",
              borderRadius: 12,
              color: "#6b7280",
            }}
          >
            Live Data
          </span>
        </div>
      }
      styles={{
        body: {
          padding: "24px",
        },
      }}
      bordered={false}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: 12 }}
    >
      {fundingStageData.length > 0 ? (
        <>
          {/* KHU VỰC BIỂU ĐỒ */}
          <div style={{ height: 320, marginBottom: 32 }}>
            <Column {...refinedConfig} />
          </div>

          {/* KHU VỰC THỐNG KÊ CHI TIẾT (LEGEND) */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: 16,
              padding: 20,
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#6b7280",
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Stage Breakdown (Total:{" "}
              <span style={{ color: "#111827", fontWeight: 700 }}>
                {stats.totalProjects}
              </span>
              )
            </div>

            <Row gutter={[12, 12]}>
              {fundingStageData.map((stage) => {
                const color =
                  STAGE_COLOR_MAP[stage.stage] || STAGE_COLOR_MAP.default;

                return (
                  <Col xs={12} sm={8} md={4} key={stage.stage}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "12px 8px",
                        background: "white",
                        borderRadius: 12,
                        // Hiệu ứng border nhẹ trùng màu với stage
                        border: `1px solid ${color}30`,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        transition: "all 0.3s",
                        cursor: "default",
                      }}
                      // Hiệu ứng hover nhẹ bằng CSS inline (hoặc dùng class)
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 4px 12px ${color}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.02)";
                      }}
                    >
                      {/* Dot màu */}
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: color,
                          marginBottom: 8,
                          boxShadow: `0 0 0 4px ${color}20`,
                        }}
                      />

                      {/* Tên Stage */}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#4b5563",
                          marginBottom: 4,
                        }}
                      >
                        {stage.stage}
                      </span>

                      {/* Số lượng */}
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#111827",
                          lineHeight: 1,
                        }}
                      >
                        {stage.count}
                      </div>

                      {/* Phần trăm */}
                      <div
                        style={{
                          fontSize: 11,
                          color: color, // Màu chữ % theo màu stage
                          fontWeight: 500,
                          marginTop: 2,
                        }}
                      >
                        {stage.percent}%
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ color: "#6b7280" }}>
              No project data available yet
            </span>
          }
        >
          <Button type="primary" icon={<PlusOutlined />}>
            Create Project
          </Button>
        </Empty>
      )}
    </Card>
  );
};
