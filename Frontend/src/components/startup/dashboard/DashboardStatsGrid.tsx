import type { FC } from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  FundOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import type { DashboardStats } from "../../../interfaces/startup/dashboard";

interface Props {
  stats: DashboardStats;
  formatCurrency: (amount: number) => string;
}

export const DashboardStatsGrid: FC<Props> = ({ stats, formatCurrency }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={6}>
        <Card
          styles={{ body: { padding: 20 } }}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>
                TOTAL RECEIVED FUNDING
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                {formatCurrency(stats.fundingRaised)}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                Actual money received
              </div>
            </div>
            <DollarCircleOutlined style={{ fontSize: 32, opacity: 0.8 }} />
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={6}>
        <Card styles={{ body: { padding: 20 } }}>
          <Statistic
            title="Active Projects"
            value={stats.totalProjects}
            prefix={<FundOutlined />}
            valueStyle={{ color: "#3b82f6" }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: "#10b981" }}>
            In your portfolio
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={6}>
        {/* Trước đây là Investor Engagement -> Giờ là Signed Contracts */}
        <Card styles={{ body: { padding: 20 } }}>
          <Statistic
            title="Signed Contracts"
            value={stats.interestedInvestors} // Đã map logic ở Dashboard.tsx
            prefix={<SolutionOutlined />}
            valueStyle={{ color: "#10b981" }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: "#10b981" }}>
            Investors fully onboarded
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={6}>
        {/* Trước đây là Avg per Project -> Giờ là Interested Investors (Meetings) */}
        <Card styles={{ body: { padding: 20 } }}>
          <Statistic
            title="Interested Investors"
            value={stats.avgInvestorEngagement} // Đã map logic ở Dashboard.tsx
            prefix={<TeamOutlined />}
            valueStyle={{ color: "#8b5cf6" }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Have created meetings
          </div>
        </Card>
      </Col>
    </Row>
  );
};
