
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchMeetings } from "../../services/features/meeting/meetingSlice";
import { api } from "../../services/constant/axiosInstance";
import { Button, Card, List, Typography, Tag, Row, Col, Space, message, Empty } from "antd";
import { VideoCameraOutlined, CalendarOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Room: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const meetingsState = useSelector((s: RootState) => s.meeting);
    const authUser = useSelector((s: RootState) => s.auth.user);

    useEffect(() => {
        dispatch(fetchMeetings() as any).catch(() => {
        });
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

    return (
        <div style={{
            padding: 24,
            maxWidth: 1200,
            margin: '0 auto',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            <div style={{
                background: 'white',
                padding: '32px 24px',
                borderRadius: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                marginBottom: 32
            }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space direction="vertical" size={8}>
                            <Title level={2} style={{
                                margin: 0,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Meeting Rooms
                            </Title>
                            <Text type="secondary" style={{ fontSize: 16 }}>
                                Manage and join your virtual meeting rooms
                            </Text>
                        </Space>
                    </Col>
                </Row>
            </div>

            {meetingsState.meetings.length === 0 ? (
                <div style={{
                    background: 'white',
                    padding: 48,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <Empty
                        description={
                            <Space direction="vertical">
                                <Text strong>No meetings found</Text>
                                <Text type="secondary">Create a new meeting from the project details page</Text>
                            </Space>
                        }
                    />
                </div>
            ) : (
                <List
                    grid={{ gutter: [24, 24], xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                    dataSource={meetingsState.meetings}
                    renderItem={(m: any) => (
                        <List.Item>
                            <Card
                                hoverable
                                style={{
                                    height: '100%',
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    border: 'none',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                                bodyStyle={{
                                    padding: 24,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div>
                                        <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>{m.topic}</Title>
                                        <Tag color="blue" style={{ marginTop: 8, borderRadius: 12 }}>{m.roomCode}</Tag>
                                    </div>

                                    <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
                                        <Space>
                                            <CalendarOutlined style={{ color: '#1890ff' }} />
                                            <Text>
                                                {new Date(m.meetingTime).toLocaleString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Text>
                                        </Space>
                                        <Space>
                                            <TeamOutlined style={{ color: '#52c41a' }} />
                                            <Text>Host: {m.createdById}</Text>
                                        </Space>
                                    </Space>

                                    {m.description && (
                                        <Text type="secondary" style={{ marginTop: 16 }}>
                                            {m.description}
                                        </Text>
                                    )}

                                    {m.recordUrl && (
                                        <div style={{ marginTop: 16 }}>
                                            <Tag color="green" style={{ borderRadius: 12 }}>Recording Available</Tag>
                                        </div>
                                    )}

                                    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                                        <Button
                                            type="primary"
                                            icon={<VideoCameraOutlined />}
                                            onClick={() => handleJoin(m.id)}
                                            style={{
                                                width: '100%',
                                                borderRadius: 8,
                                                height: 40,
                                                fontWeight: 600
                                            }}
                                        >
                                            Join Meeting
                                        </Button>
                                    </div>
                                </Space>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default Room;

