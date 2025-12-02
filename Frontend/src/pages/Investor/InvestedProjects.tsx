import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Empty,
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Progress,
  Button,
  Statistic,
  Space,
  Input,
  Select,
  Skeleton,
} from "antd";
import {
  RocketOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  DollarCircleOutlined,
  BankOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import type { RootState, AppDispatch } from "../../store";
import { getSignedProjects } from "../../services/features/project/projectSlice";
import type { Project } from "../../interfaces/project";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// --- Helper Functions ---
const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getFundingPercentage = (
  received: number = 0,
  goal: number = 1
): number => {
  if (goal <= 0) return 0;
  const percent = (received / goal) * 100;
  return Math.min(Math.round(percent), 100);
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    FINTECH: "blue",
    HEALTHCARE: "cyan",
    EDUCATION: "green",
    ECOMMERCE: "purple",
    AGRITECH: "orange",
    AI: "magenta",
    OTHER: "default",
  };
  return colors[category?.toUpperCase()] || "default";
};

const InvestedProjects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { signedProjects, status } = useSelector(
    (state: RootState) => state.project
  );

  // Local state cho bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    dispatch(getSignedProjects());
  }, [dispatch]);

  // Logic lọc dự án
  const filteredProjects = useMemo(() => {
    if (!signedProjects) return [];

    return signedProjects.filter((project) => {
      const matchesSearch = project.projectName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Giả sử logic lọc trạng thái (bạn có thể điều chỉnh theo enum ProjectStatus thực tế)
      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        if (statusFilter === "FUNDING")
          matchesStatus = project.status !== "COMPLETE"; // Ví dụ
        else if (statusFilter === "COMPLETED")
          matchesStatus = project.status === "COMPLETE";
      }

      return matchesSearch && matchesStatus;
    });
  }, [signedProjects, searchTerm, statusFilter]);

  const handleViewDetails = (projectId: number) => {
    navigate(`/investor/projects/${projectId}`);
  };

  const renderProjectCard = (project: Project) => {
    const percent = getFundingPercentage(
      Number(project.fundingReceived),
      Number(project.fundingAmount)
    );
    const logoUrl = project.files?.find(
      (f) => f.fileType === "LOGO" || f.fileType === "IMAGE"
    )?.fileUrl;

    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
        <Card
          hoverable
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 12,
            overflow: "hidden",
          }}
          bodyStyle={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 20,
          }}
          onClick={() => handleViewDetails(project.id)}
          cover={
            <div
              style={{
                height: 150,
                background: "linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={project.projectName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.85,
                  }}
                />
              ) : (
                <RocketOutlined
                  style={{ fontSize: 56, color: "rgba(255,255,255,0.7)" }}
                />
              )}

              <Tag
                color="success"
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  fontWeight: 600,
                  borderRadius: 16,
                  padding: "4px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <CheckCircleOutlined /> Invested
              </Tag>
            </div>
          }
        >
          {/* Header Info */}
          <div style={{ marginBottom: 12 }}>
            <Title
              level={4}
              style={{ margin: "0 0 8px", color: "#111827", fontSize: 18 }}
              ellipsis={{ rows: 1 }}
            >
              {project.projectName}
            </Title>

            <Space size={[0, 8]} wrap>
              <Tag color={getCategoryColor(project.category)}>
                {project.category}
              </Tag>
              <Tag
                bordered={false}
                style={{ background: "#f3f4f6", color: "#4b5563" }}
              >
                {project.fundingStage}
              </Tag>
            </Space>
          </div>

          <Paragraph
            ellipsis={{ rows: 2 }}
            type="secondary"
            style={{ fontSize: 14, minHeight: 44, marginBottom: 20 }}
          >
            {project.description ||
              "No description available for this project."}
          </Paragraph>

          {/* Funding Metrics */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <Statistic
                  title={
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      Raised
                    </span>
                  }
                  value={project.fundingReceived}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#059669",
                  }}
                  prefix={<DollarCircleOutlined style={{ fontSize: 14 }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Goal</span>
                  }
                  value={project.fundingAmount}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                  prefix={<BankOutlined style={{ fontSize: 14 }} />}
                />
              </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Funding Progress
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: 12,
                    color: percent >= 100 ? "#059669" : "#2563eb",
                  }}
                >
                  {percent}%
                </Text>
              </div>
              <Progress
                percent={percent}
                showInfo={false}
                strokeColor={
                  percent >= 100
                    ? "#059669"
                    : { "0%": "#3b82f6", "100%": "#2563eb" }
                }
                size="small"
                status="active"
              />
            </div>

            <Button
              type="primary"
              block
              ghost
              style={{ borderRadius: 8, height: 38, fontWeight: 500 }}
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(project.id);
              }}
            >
              View Dashboard <ArrowRightOutlined />
            </Button>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#f8fafc" }}>
      {/* Page Header */}
      <div
        style={{
          marginBottom: 32,
          background: "#fff",
          padding: "32px",
          borderRadius: 16,
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <Title level={2} style={{ color: "#1e3a8a", margin: "0 0 8px" }}>
            My Investment Portfolio
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Track your signed contracts and monitor the performance of your
            active investments.
          </Text>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Search
            placeholder="Search projects by name..."
            allowClear
            enterButton={
              <Button icon={<SearchOutlined />} type="primary">
                Search
              </Button>
            }
            size="large"
            style={{ maxWidth: 400, flex: 1 }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            defaultValue="ALL"
            size="large"
            style={{ width: 180 }}
            onChange={setStatusFilter}
            options={[
              { value: "ALL", label: "All Status" },
              { value: "FUNDING", label: "Active Funding" },
              { value: "COMPLETED", label: "Completed" },
            ]}
            suffixIcon={<FilterOutlined />}
          />
        </div>
      </div>

      {/* Content Area */}
      {status === "loading" &&
      (!signedProjects || signedProjects.length === 0) ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={i}>
              <Card style={{ borderRadius: 12, height: 400 }}>
                <Skeleton active avatar paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filteredProjects.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 80,
            textAlign: "center",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div style={{ marginTop: 16 }}>
                <Title level={4} style={{ color: "#64748b" }}>
                  {searchTerm
                    ? "No projects found matching your search"
                    : "Your portfolio is empty"}
                </Title>
                <Text type="secondary">
                  {searchTerm
                    ? "Try adjusting your filters or search terms."
                    : "Start exploring potential opportunities to build your portfolio."}
                </Text>
              </div>
            }
          >
            {!searchTerm && (
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                onClick={() => navigate("/investor/find-projects")}
                style={{
                  marginTop: 24,
                  padding: "0 32px",
                  height: 44,
                  borderRadius: 8,
                }}
              >
                Find Projects to Invest
              </Button>
            )}
          </Empty>
        </div>
      ) : (
        <>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong style={{ fontSize: 16, color: "#4b5563" }}>
              Showing {filteredProjects.length}{" "}
              {filteredProjects.length === 1 ? "Project" : "Projects"}
            </Text>
          </div>
          <Row gutter={[24, 24]}>{filteredProjects.map(renderProjectCard)}</Row>
        </>
      )}
    </div>
  );
};

export default InvestedProjects;
