import React from "react";
import { Row, Col, Space, Typography, Select } from "antd";
import { FilterOutlined, RocketOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface ProjectFilterHeaderProps {
  categories: string[];
  filter: string;
  onFilterChange: (value: string) => void;
}

const ProjectFilterHeader: React.FC<ProjectFilterHeaderProps> = ({
  categories,
  filter,
  onFilterChange,
}) => {
  return (
    <div
      style={{
        background: "white",
        padding: "32px 24px",
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        marginBottom: 32,
      }}
    >
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24} md={12}>
          <Space direction="vertical" size={8}>
            <Title
              level={2}
              style={{
                margin: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Discover Investment Opportunities
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Browse innovative startups seeking funding and partnership
            </Text>
          </Space>
        </Col>
        <Col xs={24} md={12}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            <FilterOutlined style={{ fontSize: 20, color: "#667eea" }} />
            <Select
              value={filter}
              onChange={onFilterChange}
              style={{ width: 240 }}
              size="large"
              suffixIcon={<RocketOutlined />}
            >
              {categories.map((c) => (
                <Option key={c} value={c}>
                  {c === "all" ? "All Categories" : c.replace(/_/g, " ")}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectFilterHeader;
