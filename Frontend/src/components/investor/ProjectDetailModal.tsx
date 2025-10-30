import React from "react";
import {
  Modal,
  Button,
  Space,
  Typography,
  Tag,
  Divider,
  Descriptions,
} from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import type { Project } from "../../interfaces/project";
import {
  getFundingRangeDisplay, // getCategoryStyle vẫn được giữ lại phòng khi cần dùng
} from "../../utils/projectUtils";

const { Title, Text, Paragraph } = Typography;

interface ProjectDetailModalProps {
  open: boolean;
  project: Project | null;
  onCancel: () => void;
  onScheduleMeeting: () => void;
}

// 1. Định nghĩa một style chung cho văn bản chi tiết
const detailTextStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600, // Tăng fontWeight
  color: "#262626", // Màu chữ đậm rõ ràng
};

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  open,
  project,
  onCancel,
  onScheduleMeeting,
}) => {
  if (!project) return null;

  // const categoryStyle = getCategoryStyle(project.category); // Không dùng style này nữa

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={null}
      footer={null}
      width={720}
      centered
      styles={{
        body: { padding: 0, borderRadius: 16, overflow: "hidden" },
      }}
    >
      {/* 1. Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "24px 32px",
          color: "white",
        }}
      >
        <Title level={2} style={{ color: "white", margin: 0, marginBottom: 8 }}>
          {project.projectName}
        </Title>
        <Space size={16}>
          <Space size={4}>
            <EnvironmentOutlined />
            <Text style={{ color: "#f0f0f0" }}>
              {project.location || "Unknown"}
            </Text>
          </Space>
          <Tag
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 600,
              border: "1px solid rgba(255, 255, 255, 0.5)",
              borderRadius: 12,
              padding: "2px 8px",
            }}
          >
            {project.category}
          </Tag>
        </Space>
      </div>

      {/* 2. Body Content */}
      <div style={{ padding: 32 }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* About Section */}
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>
              About the Project
            </Title>
            <Paragraph
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "#595959",
              }}
            >
              {project.description || "No description provided."}
            </Paragraph>
          </div>

          <Divider style={{ margin: "8px 0" }} />

          {/* Key Details Section (ĐÃ CẬP NHẬT MÀU SẮC) */}
          <div>
            <Title level={4} style={{ marginBottom: 16 }}>
              Key Details
            </Title>
            <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical">
              <Descriptions.Item
                label={
                  <Space>
                    <DollarOutlined /> Funding Goal
                  </Space>
                }
              >
                {/* 2. Đổi màu xanh lá sang màu xanh lam của theme */}
                <Text
                  strong
                  style={{
                    ...detailTextStyle,
                    color: "#667eea", // Màu chủ đạo của theme
                  }}
                >
                  {getFundingRangeDisplay(project.fundingRange)}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <CalendarOutlined /> Funding Stage
                  </Space>
                }
              >
                {/* 3. Áp dụng style chung */}
                <Text style={detailTextStyle}>
                  {project.fundingStage || "Not specified"}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <TeamOutlined /> Team Size
                  </Space>
                }
              >
                <Text style={detailTextStyle}>
                  {project.teamSize || "1"} members
                </Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <EnvironmentOutlined /> Location
                  </Space>
                }
              >
                <Text style={detailTextStyle}>
                  {project.location || "Unknown"}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* 3. Action Button Section (Giữ nguyên) */}
          <div
            style={{
              textAlign: "center",
              paddingTop: 16,
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={<VideoCameraOutlined />}
              onClick={onScheduleMeeting}
              style={{
                height: 48,
                padding: "0 32px",
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 8,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(118, 75, 162, 0.3)",
              }}
            >
              Schedule Meeting
            </Button>
          </div>
        </Space>
      </div>
    </Modal>
  );
};

export default ProjectDetailModal;
