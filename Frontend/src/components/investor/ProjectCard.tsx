import React from "react";
import { Card, Col, Space, Tag, Typography } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import type { Project } from "../../interfaces/project";
import {
  getFundingRangeDisplay,
  getCategoryStyle,
} from "../../utils/projectUtils";
import styles from "./ProjectCard.module.css"; // Import CSS module

const { Title, Text, Paragraph } = Typography;

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const pillStyle: React.CSSProperties = {
  background: "#f0f2f5",
  padding: "4px 10px",
  borderRadius: 12,
  fontSize: 13,
  color: "#4b5563",
  fontWeight: 500,
  display: "inline-block",
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project: p, onClick }) => {
  const categoryStyle = getCategoryStyle(p.category);

  return (
    <Col xs={24} sm={12} lg={8} xl={6} key={p.id}>
      <Card
        hoverable
        onClick={() => onClick(p)}
        className={styles.projectCard}
        bodyStyle={{
          padding: 20,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <Space direction="vertical" size={4} style={{ flex: 1 }}>
            <Title
              level={4}
              style={{
                margin: 0,
                color: "#1a1a1a",
              }}
            >
              {p.projectName}
            </Title>
            <Space size={4}>
              <EnvironmentOutlined style={{ color: "#666", fontSize: 14 }} />
              <Text type="secondary" style={{ fontSize: 14 }}>
                {" "}
                {p.location || "Unknown"}
              </Text>
            </Space>
          </Space>
          <Space direction="vertical" align="end" size={8}>
            <Tag
              style={{
                borderRadius: 12,
                margin: 0,
                background: categoryStyle.background,
                color: categoryStyle.color,
                border: "none",
                padding: "2px 8px",
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              {p.category}
            </Tag>
          </Space>
        </div>

        <Paragraph
          ellipsis={{ rows: 3 }}
          style={{
            marginBottom: 20,
            color: "#666",
            lineHeight: 1.6,
            flex: 1,
            fontSize: 14,
          }}
        >
          {p.description || "No description provided"}
        </Paragraph>

        <div style={{ marginBottom: 20, marginTop: 8 }}>
          <Space wrap size={8}>
            <span style={pillStyle}>
              Target: {getFundingRangeDisplay(p.fundingRange)}
            </span>
            <span style={pillStyle}>
              Stage: {p.fundingStage || "Not specified"}
            </span>
          </Space>
        </div>
      </Card>
    </Col>
  );
};

export default ProjectCard;
