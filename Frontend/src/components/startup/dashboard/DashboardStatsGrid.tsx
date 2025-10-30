import type { FC } from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  FundOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  EyeOutlined,
  ArrowUpOutlined,
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
          styles={{
            body: { padding: 20 },
          }}
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
                TOTAL FUNDING
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                {formatCurrency(stats.fundingRaised)}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                <ArrowUpOutlined style={{ marginRight: 4 }} />
                {stats.growthRate}% growth
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
            <ArrowUpOutlined /> {stats.growthRate}% growth
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={6}>
        <Card styles={{ body: { padding: 20 } }}>
          <Statistic
            title="Investor Engagement"
            value={stats.interestedInvestors}
            prefix={<TeamOutlined />}
            valueStyle={{ color: "#10b981" }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: "#10b981" }}>
            Across all projects
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={6}>
        <Card styles={{ body: { padding: 20 } }}>
          <Statistic
            title="Avg. per Project"
            value={stats.avgInvestorEngagement}
            prefix={<EyeOutlined />}
            valueStyle={{ color: "#8b5cf6" }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Investor engagement
          </div>
        </Card>
      </Col>
    </Row>
  );
};
