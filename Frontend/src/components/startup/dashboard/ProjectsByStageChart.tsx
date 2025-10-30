import type { FC } from "react";
import { Card, Row, Col, Button } from "antd";
import { Column } from "@ant-design/charts";
import type { DashboardStats } from "../../../interfaces/startup/dashboard";

interface Props {
  stats: DashboardStats;
  fundingStageData: any[];
  fundingColumnConfig: any; // Nên định nghĩa kiểu cụ thể nếu có thể
}

export const ProjectsByStageChart: FC<Props> = ({
  stats,
  fundingStageData,
  fundingColumnConfig,
}) => {
  return (
    <Card
      title={
        <div style={{ fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
          Projects by Stage
        </div>
      }
      styles={{
        body: {
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
      }}
    >
      {fundingStageData.length > 0 ? (
        <>
          {/* Biểu đồ chính */}
          <div
            style={{
              width: "100%",
              height: 400,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Column {...fundingColumnConfig} />
          </div>

          {/* Thông tin tổng quan */}
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "#f8fafc",
              borderRadius: 12,
              width: "100%",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 16,
                color: "#374151",
                textAlign: "center",
              }}
            >
              Total Projects:{" "}
              <span style={{ color: "#3b82f6" }}>{stats.totalProjects}</span>
            </div>
            <Row gutter={[8, 8]}>
              {fundingStageData.map((stage) => (
                <Col xs={8} sm={4} key={stage.stage}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: 8,
                      background: "white",
                      borderRadius: 8,
                      border: `1px solid ${stage.color}20`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: stage.color,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        {stage.stage}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: stage.color,
                        lineHeight: 1.2,
                      }}
                    >
                      {stage.count}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      {stage.percent}%
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "#6b7280" }}>No project data available</p>
          <Button type="primary" style={{ marginTop: 16 }}>
            Create Your First Project
          </Button>
        </div>
      )}
    </Card>
  );
};
