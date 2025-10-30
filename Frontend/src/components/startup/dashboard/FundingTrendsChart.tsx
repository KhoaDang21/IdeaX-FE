import type { FC } from "react";
import { Card, Select, Row, Col } from "antd";
import { Area } from "@ant-design/charts";
import type { DashboardStats } from "../../../interfaces/startup/dashboard";

interface Props {
  stats: DashboardStats;
  monthlyTrends: any[];
  timeRange: string;
  setTimeRange: (value: string) => void;
  areaChartConfig: any; // Nên định nghĩa kiểu cụ thể nếu có thể
  formatCurrency: (amount: number) => string;
}

export const FundingTrendsChart: FC<Props> = ({
  stats,
  monthlyTrends,
  timeRange,
  setTimeRange,
  areaChartConfig,
  formatCurrency,
}) => {
  return (
    <Card
      title="Funding Trends"
      extra={
        <Select
          value={timeRange}
          onChange={setTimeRange}
          size="small"
          style={{ width: 120 }}
        >
          <Select.Option value="3m">3 Months</Select.Option>
          <Select.Option value="6m">6 Months</Select.Option>
          <Select.Option value="1y">1 Year</Select.Option>
        </Select>
      }
    >
      {monthlyTrends.length > 0 ? (
        <>
          <Area {...areaChartConfig} />
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={8}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Total Funding
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#10b981",
                  }}
                >
                  {formatCurrency(stats.fundingRaised)}
                </div>
              </div>
            </Col>
            <Col xs={8}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Active Projects
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#3b82f6",
                  }}
                >
                  {stats.totalProjects}
                </div>
              </div>
            </Col>
            <Col xs={8}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Growth</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#10b981",
                  }}
                >
                  {stats.growthRate >= 0 ? "+" : ""}
                  {stats.growthRate}%
                </div>
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "#6b7280" }}>No funding data available</p>
        </div>
      )}
    </Card>
  );
};
