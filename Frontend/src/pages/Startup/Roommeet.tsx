import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
  fetchMeetingsByStartup,
  confirmMeeting,
  signMeetingNda,
  type MeetingStatus,
} from "../../services/features/meeting/meetingSlice";
import { api } from "../../services/constant/axiosInstance";
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  message,
  Empty,
  Card,
} from "antd";
import {
  VideoCameraOutlined,
  EditOutlined,
  CheckOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Roommeet: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const meetingsState = useSelector((s: RootState) => s.meeting);
  const authUser = useSelector((s: RootState) => s.auth.user);

  useEffect(() => {
    if (authUser?.id) {
      dispatch(fetchMeetingsByStartup(authUser.id) as any).catch(() => {});
    }
  }, [dispatch, authUser]);

  const handleConfirm = async (meetingId: number) => {
    if (!authUser) {
      message.error("Vui lòng đăng nhập");
      return;
    }

    try {
      await dispatch(confirmMeeting({ meetingId, startupId: authUser.id })).unwrap();
      message.success("Xác nhận meeting thành công!");
      dispatch(fetchMeetingsByStartup(authUser.id) as any);
    } catch (err: any) {
      message.error(err?.message || "Lỗi khi xác nhận meeting");
    }
  };

  const handleSignNDA = async (meetingId: number) => {
    if (!authUser) {
      message.error("Vui lòng đăng nhập");
      return;
    }

    try {
      await dispatch(signMeetingNda({ meetingId, userId: authUser.id })).unwrap();
      message.success("Ký NDA thành công!");
      dispatch(fetchMeetingsByStartup(authUser.id) as any);
    } catch (err: any) {
      message.error(err?.message || "Lỗi khi ký NDA");
    }
  };

  const handleJoin = async (meetingId: number) => {
    if (!authUser) {
      message.error("Vui lòng đăng nhập để tham gia meeting");
      return;
    }

    try {
      const res = await api.get(`/api/meetings/${meetingId}/join/${authUser.id}`);
      const url = res.data;
      if (url) {
        window.open(url, "_blank");
      } else {
        message.error("Không thể lấy link tham gia");
      }
    } catch (err: any) {
      message.error(err.response?.data || err.message || "Lỗi khi lấy link tham gia");
    }
  };

  const getStatusTag = (status?: MeetingStatus) => {
    switch (status) {
      case "PENDING":
        return <Tag color="orange">Chờ xác nhận</Tag>;
      case "WAITING_NDA":
        return <Tag color="blue">Chờ ký NDA</Tag>;
      case "CONFIRMED":
        return <Tag color="green">Đã xác nhận</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const columns = [
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Investor",
      dataIndex: "createdByName",
      key: "createdByName",
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Meeting Time",
      dataIndex: "meetingTime",
      key: "meetingTime",
      render: (time: string) => (
        <Space>
          <CalendarOutlined />
          <Text>
            {new Date(time).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: MeetingStatus) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {record.status === "PENDING" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleConfirm(record.id)}
            >
              Xác nhận
            </Button>
          )}
          {record.status === "WAITING_NDA" && record.startupStatus !== "CONFIRMED" && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleSignNDA(record.id)}
            >
              Ký NDA
            </Button>
          )}
          {record.status === "CONFIRMED" && (
            <Button
              type="primary"
              icon={<VideoCameraOutlined />}
              onClick={() => handleJoin(record.id)}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              Join Meeting
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px 16px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #eaeef5 100%)",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Title level={3} style={{ marginBottom: 24 }}>
          Meeting Rooms
        </Title>

        {meetingsState.meetings.length === 0 ? (
          <Empty description="Chưa có meeting nào" />
        ) : (
          <Table
            columns={columns}
            dataSource={meetingsState.meetings}
            rowKey="id"
            loading={meetingsState.loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
};

export default Roommeet;
