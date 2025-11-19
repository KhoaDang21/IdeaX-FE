import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjects } from "../../services/features/project/projectSlice";
import { createMeeting } from "../../services/features/meeting/meetingSlice";
import type { RootState, AppDispatch } from "../../store";
import type { Project } from "../../interfaces/project";
import type { MeetingFormData } from "../../interfaces/meeting";
import { Button, Typography, Row, Space, message, Empty } from "antd";
import InlineLoading from '../../components/InlineLoading'
import { useNavigate } from "react-router-dom";
import type { Dayjs } from "dayjs";

// Import các component con
import ProjectFilterHeader from "../../components/investor/ProjectFilterHeader";
import ProjectCard from "../../components/investor/ProjectCard";
import ProjectDetailModal from "../../components/investor/ProjectDetailModal";
import ScheduleMeetingModal from "../../components/investor/ScheduleMeetingModal";

const { Title, Text } = Typography;

const FindProjects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { projects, status, error } = useSelector((s: RootState) => s.project);
  const authUser = useSelector((s: RootState) => s.auth.user);
  // Thêm state loading cho việc tạo meeting
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

  // Filter for PUBLISHED projects
  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.status === "PUBLISHED");
  }, [projects]);

  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  const handleOpen = (p: Project) => {
    setSelected(p);
    setModalOpen(true);
  };

  const handleCloseDetail = () => {
    setModalOpen(false);
    // Không reset selected ngay, để modal đóng mượt mà
    setTimeout(() => setSelected(null), 300);
  };

  const handleOpenSchedule = () => {
    setShowMeetingForm(true);
  };

  const handleCloseSchedule = () => {
    setShowMeetingForm(false);
  };

  const handleCreateRoom = async (
    values: MeetingFormData & { meetingTime: Dayjs }
  ) => {
    if (!authUser) {
      message.error("Vui lòng đăng nhập trước khi tạo room");
      return;
    }
    if (!selected) return;

    setIsCreatingMeeting(true);
    try {
      const { meetingTime } = values;

      const payload = {
        ...values,
        meetingTime: meetingTime.format("YYYY-MM-DDTHH:mm:00"),
        startTime: meetingTime.format("YYYY-MM-DDTHH:mm:00"),
        endTime: meetingTime
          .clone()
          .add(1, "hour")
          .format("YYYY-MM-DDTHH:mm:00"),
        createdById: Number(authUser.id),
        roomCode: `ROOM-${Date.now()}`,
        projectId: selected.id, // Thêm projectId vào payload
      };

      await dispatch(createMeeting(payload)).unwrap();
      message.success("Tạo room thành công");
      setShowMeetingForm(false);
      setModalOpen(false); // Đóng cả 2 modal
      navigate("/investor/room");
    } catch (err: any) {
      message.error(err?.message || "Tạo room thất bại");
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const categories = [
    "all",
    ...Array.from(new Set(publishedProjects.map((p) => p.category))),
  ];

  const filtered =
    filter === "all"
      ? publishedProjects
      : publishedProjects.filter((p) => p.category === filter);

  // Render Loading State
  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <InlineLoading message="Loading investment opportunities..." />
        <Text type="secondary">Loading investment opportunities...</Text>
      </div>
    );
  }

  // Render Error State
  if (status === "failed") {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Title level={3} type="danger">
          Error loading projects
        </Title>
        <Text type="secondary" style={{ marginBottom: 16 }}>
          {error}
        </Text>
        <Button type="primary" onClick={() => dispatch(getAllProjects())}>
          Try Again
        </Button>
      </div>
    );
  }

  // Render Main Content
  return (
    <div
      style={{
        padding: 24,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <ProjectFilterHeader
        categories={categories}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: 48,
            borderRadius: 16,
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Empty
            description={
              <Space direction="vertical">
                <Text strong>No projects found</Text>
                <Text type="secondary">Try selecting a different category</Text>
              </Space>
            }
          />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onClick={handleOpen} />
          ))}
        </Row>
      )}

      {/* Modals */}
      <ProjectDetailModal
        open={modalOpen}
        project={selected}
        onCancel={handleCloseDetail}
        onScheduleMeeting={handleOpenSchedule}
      />

      <ScheduleMeetingModal
        open={showMeetingForm}
        project={selected}
        onCancel={handleCloseSchedule}
        onCreate={handleCreateRoom}
        loading={isCreatingMeeting}
      />
    </div>
  );
};

export default FindProjects;
