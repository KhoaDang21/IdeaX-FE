import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Row,
  Col,
  Drawer,
  message,
  Statistic,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  VideoCameraOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { api } from "../../services/constant/axiosInstance";
import InlineLoading from "../../components/InlineLoading";
import dayjs from "dayjs";

const { Option } = Select;

// Interface cho Room/Meeting
interface Room {
  id: number;
  roomCode: string;
  topic: string;
  meetingTime: string;
  description?: string;
  createdById: number;
  createdByName?: string;
  createdByEmail?: string;
  recordUrl?: string;
  projectId?: number;
  projectName?: string;
  startupId?: number;
  startupName?: string;
  startupFullName?: string;
  startupEmail?: string;
  investorFullName?: string;
  investorEmail?: string;
  status?: string;
  investorStatus?: string;
  startupStatus?: string;
  investorNdaSigned?: boolean;
  startupNdaSigned?: boolean;
  ndaCompleted?: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  PENDING: { color: "gold", text: "Pending" },
  WAITING_NDA: { color: "orange", text: "Waiting NDA" },
  CONFIRMED: { color: "green", text: "Confirmed" },
};

const RoomAndContract: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Stats
  const stats = useMemo(() => {
    return {
      total: rooms.length,
      confirmed: rooms.filter((r) => r.status === "CONFIRMED" || r.investorStatus === "CONFIRMED" || r.startupStatus === "CONFIRMED").length,
      pending: rooms.filter((r) => r.status === "PENDING" || r.investorStatus === "PENDING" || r.startupStatus === "PENDING").length,
      waitingNda: rooms.filter((r) => r.status === "WAITING_NDA" || !r.ndaCompleted).length,
    };
  }, [rooms]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/meetings");
      setRooms(res.data);
    } catch (err: any) {
      console.error(err);
      message.error("Không thể tải danh sách phòng họp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Status filter
      if (statusFilter !== "all") {
        const roomStatus = room.status || room.investorStatus || room.startupStatus || "PENDING";
        if (roomStatus !== statusFilter) return false;
      }

      // Search filter
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchTopic = room.topic?.toLowerCase().includes(search);
        const matchProject = room.projectName?.toLowerCase().includes(search);
        const matchStartup = room.startupName?.toLowerCase().includes(search) || room.startupFullName?.toLowerCase().includes(search);
        const matchInvestor = room.investorFullName?.toLowerCase().includes(search);
        const matchRoomCode = room.roomCode?.toLowerCase().includes(search);
        
        if (!matchTopic && !matchProject && !matchStartup && !matchInvestor && !matchRoomCode) {
          return false;
        }
      }

      return true;
    });
  }, [rooms, statusFilter, searchText]);

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setDrawerOpen(true);
  };

  const columns: ColumnsType<Room> = [
    {
      title: "Room Code",
      dataIndex: "roomCode",
      key: "roomCode",
      width: 150,
      render: (code) => (
        <Tag color="blue" icon={<VideoCameraOutlined />}>
          {code}
        </Tag>
      ),
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      width: 250,
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      width: 200,
      render: (text) => text || "-",
    },
    {
      title: "Participants",
      key: "participants",
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <TeamOutlined style={{ marginRight: 4, color: "#1890ff" }} />
            <span style={{ fontSize: 12 }}>
              Investor: {record.investorFullName || record.createdByName || "N/A"}
            </span>
          </div>
          <div>
            <UserOutlined style={{ marginRight: 4, color: "#52c41a" }} />
            <span style={{ fontSize: 12 }}>
              Startup: {record.startupFullName || record.startupName || "N/A"}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "Meeting Time",
      dataIndex: "meetingTime",
      key: "meetingTime",
      width: 180,
      render: (time) => (
        <Space>
          <CalendarOutlined />
          {dayjs(time).format("DD/MM/YYYY HH:mm")}
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 150,
      align: "center",
      render: (_, record) => {
        const status = record.status || record.investorStatus || record.startupStatus || "PENDING";
        const config = STATUS_CONFIG[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "NDA",
      key: "nda",
      width: 120,
      align: "center",
      render: (_, record) => {
        const investorSigned = record.investorNdaSigned;
        const startupSigned = record.startupNdaSigned;
        const allSigned = investorSigned && startupSigned;

        return (
          <Space direction="vertical" size="small">
            {allSigned ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Completed
              </Tag>
            ) : (
              <Tag color="orange" icon={<ClockCircleOutlined />}>
                Pending
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          Room Management
        </h1>
        <p style={{ margin: "8px 0 0 0", color: "#666" }}>
          Manage all meeting rooms created by investors and startups
        </p>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card bodyStyle={{ padding: "16px" }}>
            <Statistic
              title="Total Rooms"
              value={stats.total}
              prefix={<VideoCameraOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bodyStyle={{ padding: "16px" }}>
            <Statistic
              title="Confirmed"
              value={stats.confirmed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bodyStyle={{ padding: "16px" }}>
            <Statistic
              title="Pending"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bodyStyle={{ padding: "16px" }}>
            <Statistic
              title="Waiting NDA"
              value={stats.waitingNda}
              prefix={<FileProtectOutlined />}
              valueStyle={{ color: "#ff7a45" }}
            />
          </Card>
        </Col>
      </Row>

      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "16px", fontWeight: "600", fontSize: "16px" }}>
          Meeting Rooms Directory
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            style={{ width: 180 }}
            placeholder="Filter by status"
          >
            <Option value="all">All Status</Option>
            <Option value="PENDING">Pending</Option>
            <Option value="WAITING_NDA">Waiting NDA</Option>
            <Option value="CONFIRMED">Confirmed</Option>
          </Select>

          <Input.Search
            placeholder="Search by topic, project, participants..."
            onSearch={(val) => setSearchText(val)}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 400 }}
          />

          <Button type="primary" onClick={fetchRooms}>
            Refresh
          </Button>
        </Space>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <InlineLoading />
          </div>
        ) : (
          <Table<Room>
            columns={columns}
            dataSource={filteredRooms}
            rowKey={(r) => r.id}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            scroll={{ x: 1200 }}
          />
        )}

        {/* Drawer for Room Details */}
        <Drawer
          width={520}
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          title={selectedRoom ? selectedRoom.topic : "Room Details"}
        >
          {selectedRoom && (
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Card title="Basic Information" size="small">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <strong>Room Code:</strong>{" "}
                    <Tag color="blue">{selectedRoom.roomCode}</Tag>
                  </div>
                  <div>
                    <strong>Topic:</strong> {selectedRoom.topic}
                  </div>
                  <div>
                    <strong>Meeting Time:</strong>{" "}
                    {dayjs(selectedRoom.meetingTime).format("DD/MM/YYYY HH:mm")}
                  </div>
                  {selectedRoom.description && (
                    <div>
                      <strong>Description:</strong>
                      <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                        {selectedRoom.description}
                      </div>
                    </div>
                  )}
                </Space>
              </Card>

              <Card title="Project Information" size="small">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <strong>Project:</strong> {selectedRoom.projectName || "N/A"}
                  </div>
                  <div>
                    <strong>Project ID:</strong> {selectedRoom.projectId || "N/A"}
                  </div>
                </Space>
              </Card>

              <Card title="Participants" size="small">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <strong>Investor:</strong>
                    <div style={{ marginTop: 4 }}>
                      <div>{selectedRoom.investorFullName || "N/A"}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {selectedRoom.investorEmail || ""}
                      </div>
                    </div>
                  </div>
                  <div>
                    <strong>Startup:</strong>
                    <div style={{ marginTop: 4 }}>
                      <div>
                        {selectedRoom.startupFullName ||
                          selectedRoom.startupName ||
                          "N/A"}
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {selectedRoom.startupEmail || ""}
                      </div>
                    </div>
                  </div>
                </Space>
              </Card>

              <Card title="Status & NDA" size="small">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <strong>Room Status:</strong>{" "}
                    <Tag
                      color={
                        STATUS_CONFIG[
                          selectedRoom.status ||
                            selectedRoom.investorStatus ||
                            "PENDING"
                        ]?.color || "default"
                      }
                    >
                      {STATUS_CONFIG[
                        selectedRoom.status ||
                          selectedRoom.investorStatus ||
                          "PENDING"
                      ]?.text || "Unknown"}
                    </Tag>
                  </div>
                  <div>
                    <strong>Investor NDA:</strong>{" "}
                    {selectedRoom.investorNdaSigned ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Signed
                      </Tag>
                    ) : (
                      <Tag color="orange" icon={<ClockCircleOutlined />}>
                        Not Signed
                      </Tag>
                    )}
                  </div>
                  <div>
                    <strong>Startup NDA:</strong>{" "}
                    {selectedRoom.startupNdaSigned ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Signed
                      </Tag>
                    ) : (
                      <Tag color="orange" icon={<ClockCircleOutlined />}>
                        Not Signed
                      </Tag>
                    )}
                  </div>
                  <div>
                    <strong>NDA Completed:</strong>{" "}
                    {selectedRoom.ndaCompleted ? (
                      <Tag color="green">Yes</Tag>
                    ) : (
                      <Tag color="orange">No</Tag>
                    )}
                  </div>
                </Space>
              </Card>

              {selectedRoom.recordUrl && (
                <Card title="Recording" size="small">
                  <a
                    href={selectedRoom.recordUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Recording
                  </a>
                </Card>
              )}
            </Space>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default RoomAndContract;
