import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Spin,
  Tabs,
  Statistic,
  Divider,
  Avatar,
  List,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  GlobalOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  RocketOutlined,
  BankOutlined,
} from "@ant-design/icons";
import type { RootState, AppDispatch } from "../../store";
import {
  getProjectById,
  getMilestonesByProject,
} from "../../services/features/project/projectSlice";

const { Title, Text, Paragraph } = Typography;

const InvestorProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { project, milestones, status } = useSelector(
    (state: RootState) => state.project
  );
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    if (id) {
      dispatch(getProjectById(Number(id)));
      dispatch(getMilestonesByProject(Number(id)));
    }
  }, [id, dispatch]);

  if (status === "loading" || !project) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const logoUrl = project.files?.find(
    (f) => f.fileType === "LOGO" || f.fileType === "IMAGE"
  )?.fileUrl;

  const items = [
    {
      key: "1",
      label: "Overview",
      children: (
        <div>
          <Title level={4}>About {project.projectName}</Title>
          <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
            {project.description}
          </Paragraph>

          <Divider />

          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Statistic
                title="Team Size"
                value={project.teamSize}
                prefix={<TeamOutlined />}
                suffix="members"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Location"
                value={project.location}
                prefix={<EnvironmentOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Website"
                value={project.website}
                formatter={(val) => (
                  <a href={String(val)} target="_blank" rel="noreferrer">
                    {val}
                  </a>
                )}
                prefix={<GlobalOutlined />}
              />
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "2",
      label: "Milestones",
      children: (
        <List
          itemLayout="horizontal"
          dataSource={milestones}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  item.status === "COMPLETED" ? (
                    <CheckCircleOutlined
                      style={{ fontSize: 24, color: "#52c41a" }}
                    />
                  ) : (
                    <ClockCircleOutlined
                      style={{ fontSize: 24, color: "#1890ff" }}
                    />
                  )
                }
                title={<Text strong>{item.title}</Text>}
                description={
                  <div>
                    <div>{item.description}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Due: {item.dueDate}
                    </Text>
                  </div>
                }
              />
              <Tag color={item.status === "COMPLETED" ? "green" : "blue"}>
                {item.status}
              </Tag>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "3",
      label: "Documents",
      children: (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={project.files?.filter((f) =>
            ["PITCH_DECK", "BUSINESS_PLAN", "FINANCIAL_PROJECTION"].includes(
              f.fileType
            )
          )}
          renderItem={(file) => (
            <List.Item>
              <Card hoverable size="small" style={{ cursor: "default" }}>
                <Space>
                  <FilePdfOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />
                  <div>
                    <Text strong style={{ display: "block" }}>
                      {file.fileType.replace("_", " ")}
                    </Text>
                    <a href={file.fileUrl} target="_blank" rel="noreferrer">
                      Download / View
                    </a>
                  </div>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back to Portfolio
      </Button>

      <Row gutter={[24, 24]}>
        {/* Left Column: Main Info */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <Avatar
                shape="square"
                size={80}
                src={logoUrl}
                icon={<RocketOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              <div style={{ flex: 1 }}>
                <Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
                  {project.projectName}
                </Title>
                <Space>
                  <Tag color="blue">{project.category}</Tag>
                  <Tag color="gold">{project.fundingStage}</Tag>
                  <Tag color="green">INVESTED</Tag>
                </Space>
              </div>
            </div>
          </Card>

          <Card style={{ borderRadius: 12 }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
          </Card>
        </Col>

        {/* Right Column: Financial Summary */}
        <Col xs={24} lg={8}>
          <Card title="Investment Summary" style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Raised"
              value={project.fundingReceived}
              prefix={<DollarCircleOutlined />}
              groupSeparator=","
              suffix="VND"
              valueStyle={{ color: "#3f8600" }}
            />
            <Divider style={{ margin: "16px 0" }} />
            <Statistic
              title="Funding Goal"
              value={project.fundingAmount}
              prefix={<BankOutlined />}
              groupSeparator=","
              suffix="VND"
            />

            <div style={{ marginTop: 24 }}>
              <Button type="primary" block size="large">
                Contact Founder
              </Button>
              <Button block style={{ marginTop: 12 }}>
                Request Report
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InvestorProjectDetails;
