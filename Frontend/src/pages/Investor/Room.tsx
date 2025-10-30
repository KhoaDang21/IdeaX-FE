import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchMeetings } from "../../services/features/meeting/meetingSlice";
import { api } from "../../services/constant/axiosInstance";
import {
    Button,
    Card,
    List,
    Typography,
    Tag,
    Row,
    Col,
    Space,
    message,
    Empty,
    Divider,
} from "antd";
import {
    VideoCameraOutlined,
    CalendarOutlined,
    UserOutlined,
    GlobalOutlined,
    FileTextOutlined,
    EditOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Room: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const meetingsState = useSelector((s: RootState) => s.meeting);
    const authUser = useSelector((s: RootState) => s.auth.user);

    useEffect(() => {
        dispatch(fetchMeetings() as any).catch(() => { });
    }, [dispatch]);

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

    const handleSignNDA = (meetingId: number) => {
        message.success(`Đã mở trang ký NDA cho meeting #${meetingId}`);
        // TODO: mở modal ký NDA hoặc redirect sang trang ký NDA
    };

    return (
        <div
            style={{
                padding: "24px 16px",
                background: "linear-gradient(135deg, #f5f7fa 0%, #eaeef5 100%)",
                minHeight: "100vh",
            }}
        >
            {/* Header Section */}
            <div
                style={{
                    background: "white",
                    padding: "24px 28px",
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    marginBottom: 24,
                }}
            >
                <Row justify="space-between" align="middle">
                    <Col xs={24} md={12}>
                        <Space direction="vertical" size={6}>
                            <Space align="center">
                                <GlobalOutlined
                                    style={{
                                        fontSize: 26,
                                        color: "#1890ff",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                />
                                <Title
                                    level={3}
                                    style={{
                                        margin: 0,
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontWeight: 700,
                                    }}
                                >
                                    Meeting Rooms
                                </Title>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 14, color: "#666" }}>
                                Manage and join your scheduled meetings
                            </Text>
                        </Space>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: "right" }}>
                        <Tag
                            color="blue"
                            style={{
                                borderRadius: 12,
                                padding: "4px 10px",
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            Total: {meetingsState.meetings.length} meetings
                        </Tag>
                    </Col>
                </Row>
            </div>

            {/* Meeting List */}
            {meetingsState.meetings.length === 0 ? (
                <div
                    style={{
                        background: "white",
                        padding: 60,
                        borderRadius: 12,
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <Space direction="vertical" size={8}>
                                <Text strong style={{ fontSize: 15, color: "#1a1a1a" }}>
                                    No meetings found
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    Create a new meeting from the project page
                                </Text>
                            </Space>
                        }
                    />
                </div>
            ) : (
                <List
                    grid={{
                        gutter: [20, 20],
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 4,
                        xl: 4,
                        xxl: 4,
                    }}
                    dataSource={meetingsState.meetings}
                    renderItem={(m: any) => (
                        <List.Item>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: 10,
                                    border: "1px solid #f0f0f0",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                                    transition: "all 0.25s ease",
                                    height: "100%",
                                }}
                                bodyStyle={{
                                    padding: "18px 20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    height: "100%",
                                }}
                            >
                                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                                    {/* Title */}
                                    <div>
                                        <Title
                                            level={5}
                                            style={{
                                                margin: 0,
                                                color: "#1a1a1a",
                                                fontWeight: 600,
                                                lineHeight: 1.4,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                height: "2.8em",
                                            }}
                                            title={m.topic}
                                        >
                                            {m.topic}
                                        </Title>
                                        <Tag
                                            color="geekblue"
                                            style={{
                                                marginTop: 6,
                                                borderRadius: 8,
                                                padding: "2px 8px",
                                                fontSize: 12,
                                                border: "none",
                                            }}
                                        >
                                            {m.roomCode}
                                        </Tag>
                                    </div>

                                    {/* Details */}
                                    <Divider style={{ margin: "8px 0" }} />

                                    <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                        <Row gutter={6} align="middle">
                                            <Col flex="18px">
                                                <CalendarOutlined style={{ color: "#1890ff", fontSize: 13 }} />
                                            </Col>
                                            <Col flex="auto">
                                                <Text style={{ fontSize: 13 }}>
                                                    {new Date(m.meetingTime).toLocaleString("vi-VN", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </Text>
                                            </Col>
                                        </Row>

                                        <Row gutter={6} align="middle">
                                            <Col flex="18px">
                                                <UserOutlined style={{ color: "#52c41a", fontSize: 13 }} />
                                            </Col>
                                            <Col flex="auto">
                                                <Text style={{ fontSize: 13 }}>{m.createdByName || "Unknown"}</Text>
                                            </Col>
                                        </Row>

                                        {m.projectName && (
                                            <Row gutter={6} align="middle">
                                                <Col flex="18px">
                                                    <GlobalOutlined style={{ color: "#722ed1", fontSize: 13 }} />
                                                </Col>
                                                <Col flex="auto">
                                                    <Text style={{ fontSize: 13 }}>{m.projectName}</Text>
                                                </Col>
                                            </Row>
                                        )}
                                    </Space>

                                    {/* Description with icon */}
                                    {m.description && (
                                        <Row gutter={6} align="middle" style={{ marginTop: 6 }}>
                                            <Col flex="18px">
                                                <FileTextOutlined style={{ color: "#fa8c16", fontSize: 13 }} />
                                            </Col>
                                            <Col flex="auto">
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontSize: 12.5,
                                                        lineHeight: 1.4,
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {m.description}
                                                </Text>
                                            </Col>
                                        </Row>
                                    )}
                                </Space>

                                {/* Buttons: Sign NDA + Join */}
                                <Row
                                    gutter={10}
                                    justify="space-between"
                                    align="middle"
                                    style={{ marginTop: 14 }}
                                >
                                    <Col span={12}>
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={() => handleSignNDA(m.id)}
                                            block
                                            style={{
                                                height: 38,
                                                borderRadius: 8,
                                                fontWeight: 500,
                                                fontSize: 13.5,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 6,
                                            }}
                                        >
                                            Ký NDA
                                        </Button>
                                    </Col>
                                    <Col span={12}>
                                        <Button
                                            type="primary"
                                            icon={<VideoCameraOutlined />}
                                            onClick={() => handleJoin(m.id)}
                                            block
                                            style={{
                                                height: 38,
                                                borderRadius: 8,
                                                fontWeight: 600,
                                                fontSize: 13.5,
                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                border: "none",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 6,
                                            }}
                                        >
                                            Join Meeting
                                        </Button>
                                    </Col>
                                </Row>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default Room;
