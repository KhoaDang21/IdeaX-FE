// src/pages/admin/ProjectManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllProjects,
  publishProject,
  rejectProject,
  deleteProject,
} from "../../services/features/project/projectSlice";
import type { RootState, AppDispatch } from "../../store";
import type { Project } from "../../interfaces/project";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Space,
  message,
  Popconfirm,
  Empty,
  Statistic,
  Modal,
  Input,
  Tabs,
} from "antd";
import {
  FileTextOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import InlineLoading from '../../components/InlineLoading'

const { Title, Text } = Typography;

/**
 * Hiển thị Tag màu dựa trên trạng thái của dự án
 */
const getStatusTag = (status: string) => {
  switch (status.toUpperCase()) {
    case "DRAFT":
      return <Tag color="warning">Waiting for Review</Tag>;
    case "PUBLISHED":
      return <Tag color="success">Ongoing</Tag>;
    case "APPROVED":
      return <Tag color="processing">In Deal</Tag>;
    case "REJECTED":
      return <Tag color="error">Rejected</Tag>;
    case "PAUSED":
      return <Tag color="gold">Paused</Tag>;
    case "COMPLETE":
      return <Tag color="default">Completed</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const ProjectManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { projects, status, error } = useSelector((s: RootState) => s.project);

  // State cho Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);


  // Tách dự án
  const [pendingProjects, activeProjects] = useMemo(() => {
    const pending = projects.filter((p) => p.status === "DRAFT");
    const active = projects.filter(
      (p) => p.status !== "DRAFT" && p.status !== "REJECTED"
    );
    return [pending, active];
  }, [projects]);

  // Tính toán số liệu thống kê
  const stats = useMemo(() => {
    const rejectedCount = projects.filter(
      (p) => p.status === "REJECTED"
    ).length;

    return {
      total: projects.length,
      active: activeProjects.length,
      pending: pendingProjects.length,
      rejected: rejectedCount,
    };
  }, [projects, activeProjects, pendingProjects]);

  // --- Handlers ---

  const handlePublish = async (id: number) => {
    try {
      await dispatch(publishProject(id)).unwrap();
      message.success("Project published successfully!");
    } catch (err) {
      message.error("Failed to publish project.");
    }
  };

  // Mở modal
  const showRejectModal = (id: number) => {
    setCurrentProjectId(id);
    setIsRejectModalOpen(true);
  };

  // Đóng modal
  const handleCancelReject = () => {
    setIsRejectModalOpen(false);
    setRejectReason("");
    setCurrentProjectId(null);
  };

  // Xử lý Reject
  const handleReject = async () => {
    if (!currentProjectId) return;

    if (!rejectReason.trim()) {
      message.error("Please provide a reason for rejection.");
      return;
    }

    try {
      await dispatch(
        rejectProject({ id: currentProjectId, note: rejectReason })
      ).unwrap();
      message.success("Project rejected.");
      handleCancelReject();
    } catch (err) {
      message.error("Failed to reject project.");
    }
  };

  // Xử lý Delete
  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteProject(id)).unwrap();
      message.success("Project deleted successfully.");
    } catch (err) {
      message.error("Failed to delete project.");
    }
  };

  // Xem chi tiết
  const handleViewDetails = (id: number) => {
    navigate(`/admin/projects/${id}`);
  };

  // --- Định nghĩa Cột ---

  // Cột cho Bảng "New Project Submissions"
  const pendingColumns: ColumnsType<Project> = [
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      render: (text, record) => (
        <Button
          type="link"
          style={{ padding: 0, textAlign: "left" }}
          onClick={() => handleViewDetails(record.id)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Startup",
      dataIndex: "startupName",
      key: "startupName",
      render: (text) => text || "N/A",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Publish this project?"
            onConfirm={() => handlePublish(record.id)}
          >
            {/* === SỬA ĐỔI 1: Chuyển thành nút solid 'primary' === */}
            <Button type="primary" icon={<CheckCircleOutlined />}>
              Publish
            </Button>
          </Popconfirm>
          <Button
            danger
            ghost // Giữ nguyên 'danger ghost'
            icon={<CloseCircleOutlined />}
            onClick={() => showRejectModal(record.id)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  // Cột cho Bảng "Active Projects"
  const activeColumns: ColumnsType<Project> = [
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      render: (text, record) => (
        <Button
          type="link"
          style={{ padding: 0, textAlign: "left" }}
          onClick={() => handleViewDetails(record.id)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Startup",
      dataIndex: "startupName",
      key: "startupName",
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Start Date",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "PAUSED" ? (
            <Popconfirm
              title="Resume this project?"
              onConfirm={() => message.info("Chức năng đang phát triển!")}
              okText="Yes"
              cancelText="No"
            >
              {/* === SỬA ĐỔI 2: Chuyển thành 'primary ghost' === */}
              <Button type="primary" icon={<PlayCircleOutlined />} ghost>
                Resume
              </Button>
            </Popconfirm>
          ) : (
            (record.status === "PUBLISHED" || record.status === "APPROVED") && (
              <Popconfirm
                title="Pause this project?"
                onConfirm={() => message.info("Chức năng đang phát triển!")}
                okText="Yes"
                cancelText="No"
              >
                {/* Giữ nguyên style viền vàng 'warning' */}
                <Button
                  icon={<PauseCircleOutlined />}
                  style={{ color: "#faad14", borderColor: "#faad14" }}
                  ghost
                >
                  Pause
                </Button>
              </Popconfirm>
            )
          )}

          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            {/* === SỬA ĐỔI 3: Chuyển thành 'danger ghost' === */}
            <Button danger ghost icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- Render ---

  if (status === "loading" && projects.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <InlineLoading />
      </div>
    );
  }

  if (status === "failed") {
    return <Empty description={<Text type="danger">{error}</Text>} />;
  }

  return (
    <Layout style={{ padding: 24, background: "#f0f2f5" }}>
      <Space direction="vertical" style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Project Management
        </Title>
        <Text type="secondary">
          Review new submissions and manage active projects across the platform
        </Text>
      </Space>

      {/* Stats Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={stats.active}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ marginTop: 24 }}>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                New Submissions (<b>{stats.pending}</b>)
              </span>
            }
            key="1"
          >
            <Table
              columns={pendingColumns}
              dataSource={pendingProjects}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              locale={{ emptyText: "No new projects are awaiting review." }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <BarChartOutlined />
                Active Projects (<b>{stats.active}</b>)
              </span>
            }
            key="2"
          >
            <Table
              columns={activeColumns}
              dataSource={activeProjects}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              locale={{ emptyText: "There are no active projects." }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* MODAL */}
      <Modal
        title="Reject Project"
        open={isRejectModalOpen}
        onOk={handleReject}
        onCancel={handleCancelReject}
        confirmLoading={status === "loading"}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <Text>Please provide a reason for rejecting this project:</Text>
        <Input.TextArea
          rows={4}
          style={{ marginTop: 8 }}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="E.g., Missing information, not aligned with goals..."
        />
      </Modal>
    </Layout>
  );
};

export default ProjectManagement;
