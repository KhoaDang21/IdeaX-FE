import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjects } from "../../services/features/project/projectSlice";
import { createMeeting } from "../../services/features/meeting/meetingSlice";
import type { RootState, AppDispatch } from "../../store";
import type { Project } from "../../interfaces/project";
import type { MeetingFormData } from "../../interfaces/meeting";
import {
    Card,
    Button,
    Tag,
    Progress,
    Typography,
    Row,
    Col,
    Modal,
    Select,
    Form,
    DatePicker,
    Input,
    Space,
    message,
    Spin,
    Empty,
    Divider
} from "antd";
import {
    EyeOutlined,
    FilterOutlined,
    VideoCameraOutlined,
    DollarOutlined,
    TeamOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    RocketOutlined
} from "@ant-design/icons";
import "./investor.css";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const FindProjects: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { projects, status, error } = useSelector((s: RootState) => s.project);
    const authUser = useSelector((s: RootState) => s.auth.user);

    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState<Project | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [showMeetingForm, setShowMeetingForm] = useState(false);
    const [form] = Form.useForm<MeetingFormData>();

    useEffect(() => {
        dispatch(getAllProjects());
    }, [dispatch]);

    const handleOpen = (p: Project) => {
        setSelected(p);
        setModalOpen(true);
    };

    const handleCreateRoom = async () => {
        if (!authUser) {
            message.error("Vui lòng đăng nhập trước khi tạo room");
            return;
        }
        if (!selected) return;

        try {
            const values = await form.validateFields();
            const meetingTime = values.meetingTime;

            const payload = {
                ...values,
                meetingTime: meetingTime.format('YYYY-MM-DD HH:mm:00'),
                startTime: meetingTime.format('YYYY-MM-DD HH:mm:00'),
                endTime: meetingTime.clone().add(1, 'hour').format('YYYY-MM-DD HH:mm:00'),
                createdById: Number(authUser.id),
                roomCode: `ROOM-${Date.now()}` // Will be overwritten by BE
            };

            await dispatch(createMeeting(payload)).unwrap();
            message.success("Tạo room thành công");
            setShowMeetingForm(false);
            setModalOpen(false);
            form.resetFields();
            navigate("/investor/room");
        } catch (err: any) {
            if (err.errorFields) {
                message.error("Vui lòng điền đầy đủ thông tin");
            } else {
                message.error(err?.message || "Tạo room thất bại");
            }
        }
    };

    const categories = ["all", ...Array.from(new Set(projects.map((p) => p.category)))];

    const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "green";
            case "PENDING": return "orange";
            case "REJECTED": return "red";
            default: return "blue";
        }
    };

    const getCategoryColor = (category: string) => {
        const colors = ["magenta", "purple", "cyan", "blue", "geekblue", "volcano"];
        const index = Math.abs(category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length;
        return colors[index];
    };

    if (status === "loading") {
        return (
            <div style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: 'column',
                gap: 16
            }}>
                <Spin size="large" />
                <Text type="secondary">Loading investment opportunities...</Text>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div style={{
                padding: 24,
                textAlign: 'center',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Title level={3} type="danger">Error loading projects</Title>
                <Text type="secondary" style={{ marginBottom: 16 }}>{error}</Text>
                <Button type="primary" onClick={() => dispatch(getAllProjects())}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div style={{
            padding: 24,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            {/* Header Section */}
            <div style={{
                background: 'white',
                padding: '32px 24px',
                borderRadius: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                marginBottom: 32
            }}>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} md={12}>
                        <Space direction="vertical" size={8}>
                            <Title level={2} style={{
                                margin: 0,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Discover Investment Opportunities
                            </Title>
                            <Text type="secondary" style={{ fontSize: 16 }}>
                                Browse innovative startups seeking funding and partnership
                            </Text>
                        </Space>
                    </Col>
                    <Col xs={24} md={12}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            justifyContent: 'flex-end'
                        }}>
                            <FilterOutlined style={{ fontSize: 20, color: '#667eea' }} />
                            <Select
                                value={filter}
                                onChange={(v) => setFilter(String(v))}
                                style={{ width: 240 }}
                                size="large"
                                suffixIcon={<RocketOutlined />}
                            >
                                {categories.map((c) => (
                                    <Option key={c} value={c}>
                                        {c === "all" ? "All Categories" : c.replace(/_/g, " ")}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Projects Grid */}
            {filtered.length === 0 ? (
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
                                <Text strong>No projects found</Text>
                                <Text type="secondary">Try selecting a different category</Text>
                            </Space>
                        }
                    />
                </div>
            ) : (
                <Row gutter={[24, 24]}>
                    {filtered.map((p) => {
                        const fundingReceived = (p as any).fundingReceived ?? 0;
                        const fundingGoal = p.fundingAmount ?? ((p as any).minimumInvestment ? (p as any).minimumInvestment * 10 : 500000);
                        const percent = fundingGoal > 0 ? Math.round((Number(fundingReceived) / Number(fundingGoal)) * 100) : 0;

                        return (
                            <Col xs={24} sm={12} lg={8} xl={6} key={p.id}>
                                <Card
                                    hoverable
                                    className="project-card"
                                    style={{
                                        height: '100%',
                                        borderRadius: 16,
                                        overflow: 'hidden',
                                        border: 'none',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    bodyStyle={{
                                        padding: 20,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: 'flex-start',
                                        marginBottom: 16
                                    }}>
                                        <Space direction="vertical" size={4} style={{ flex: 1 }}>
                                            <Title level={4} style={{
                                                margin: 0,
                                                color: '#1a1a1a'
                                            }}>
                                                {p.projectName}
                                            </Title>
                                            <Space size={4}>
                                                <EnvironmentOutlined style={{ color: '#666', fontSize: 12 }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {p.location || "Unknown"}
                                                </Text>
                                            </Space>
                                        </Space>
                                        <Space direction="vertical" align="end" size={8}>
                                            <Tag
                                                color={getStatusColor(p.status)}
                                                style={{
                                                    margin: 0,
                                                    fontWeight: 600,
                                                    borderRadius: 12
                                                }}
                                            >
                                                {p.status}
                                            </Tag>
                                            <Tag
                                                color={getCategoryColor(p.category)}
                                                style={{
                                                    borderRadius: 12,
                                                    margin: 0
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
                                            color: '#666',
                                            lineHeight: 1.6,
                                            flex: 1
                                        }}
                                    >
                                        {p.description || "No description provided"}
                                    </Paragraph>

                                    {/* Funding Progress */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: 8,
                                            alignItems: 'center'
                                        }}>
                                            <Space size={4}>
                                                <DollarOutlined style={{ color: '#52c41a' }} />
                                                <Text strong style={{ color: '#52c41a' }}>
                                                    {new Intl.NumberFormat("en-US", {
                                                        style: "currency",
                                                        currency: "USD",
                                                        maximumFractionDigits: 0
                                                    }).format(Number(fundingReceived))}
                                                </Text>
                                            </Space>
                                            <Text type="secondary">
                                                Goal: {new Intl.NumberFormat("en-US", {
                                                    style: "currency",
                                                    currency: "USD",
                                                    maximumFractionDigits: 0
                                                }).format(Number(fundingGoal))}
                                            </Text>
                                        </div>
                                        <Progress
                                            percent={Math.max(0, Math.min(100, percent))}
                                            showInfo
                                            strokeColor={{
                                                '0%': '#108ee9',
                                                '100%': '#87d068',
                                            }}
                                            trailColor="#f0f0f0"
                                        />
                                    </div>

                                    <Button
                                        type="primary"
                                        block
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpen(p);
                                        }}
                                        icon={<EyeOutlined />}
                                        style={{
                                            borderRadius: 8,
                                            height: 40,
                                            fontWeight: 600
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Project Detail Modal */}
            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                title={null}
                footer={null}
                width={800}
                centered
                className="project-detail-modal"
                styles={{
                    body: { padding: 0 }
                }}
            >
                {selected && (
                    <div style={{ background: 'white', borderRadius: 16 }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '32px 24px',
                            color: 'white'
                        }}>
                            <Title level={2} style={{ color: 'white', margin: 0 }}>
                                {selected.projectName}
                            </Title>
                            <Space size={16} style={{ marginTop: 8 }}>
                                <Space size={4}>
                                    <EnvironmentOutlined />
                                    <Text style={{ color: 'white' }}>{selected.location || "Unknown"}</Text>
                                </Space>
                                <Tag color="white" style={{ color: '#667eea', fontWeight: 600 }}>
                                    {selected.category}
                                </Tag>
                                <Tag color="white" style={{ color: getStatusColor(selected.status), fontWeight: 600 }}>
                                    {selected.status}
                                </Tag>
                            </Space>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 24 }}>
                            <Space direction="vertical" size={24} style={{ width: '100%' }}>
                                <div>
                                    <Title level={4}>About the Project</Title>
                                    <Paragraph style={{
                                        fontSize: 16,
                                        lineHeight: 1.7,
                                        color: '#333'
                                    }}>
                                        {selected.description || "No description provided."}
                                    </Paragraph>
                                </div>

                                <Divider />

                                <Row gutter={32}>
                                    <Col xs={24} sm={12} lg={8}>
                                        <Space direction="vertical" size={8} align="center" style={{ textAlign: 'center' }}>
                                            <DollarOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                                            <Title level={5} style={{ margin: 0 }}>Funding Goal</Title>
                                            <Text strong style={{ fontSize: 18 }}>
                                                {selected.fundingAmount ? new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                    maximumFractionDigits: 0
                                                }).format(selected.fundingAmount) : 'Not specified'}
                                            </Text>
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={12} lg={8}>
                                        <Space direction="vertical" size={8} align="center" style={{ textAlign: 'center' }}>
                                            <TeamOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                                            <Title level={5} style={{ margin: 0 }}>Team Size</Title>
                                            <Text strong style={{ fontSize: 18 }}>
                                                {selected.teamSize || 1} members
                                            </Text>
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={12} lg={8}>
                                        <Space direction="vertical" size={8} align="center" style={{ textAlign: 'center' }}>
                                            <CalendarOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
                                            <Title level={5} style={{ margin: 0 }}>Funding Stage</Title>
                                            <Text strong style={{ fontSize: 18 }}>
                                                {selected.fundingStage || 'Not specified'}
                                            </Text>
                                        </Space>
                                    </Col>
                                </Row>

                                <div style={{
                                    textAlign: 'center',
                                    paddingTop: 24,
                                    borderTop: '1px solid #f0f0f0'
                                }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<VideoCameraOutlined />}
                                        onClick={() => setShowMeetingForm(true)}
                                        style={{
                                            height: 48,
                                            padding: '0 32px',
                                            fontSize: 16,
                                            fontWeight: 600,
                                            borderRadius: 8,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none'
                                        }}
                                    >
                                        Schedule Meeting
                                    </Button>
                                </div>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Meeting Form Modal */}
            <Modal
                open={showMeetingForm}
                onCancel={() => {
                    setShowMeetingForm(false);
                    form.resetFields();
                }}
                title={
                    <Space>
                        <VideoCameraOutlined style={{ color: '#667eea' }} />
                        <span>Create Meeting Room</span>
                    </Space>
                }
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setShowMeetingForm(false);
                            form.resetFields();
                        }}
                        size="large"
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="create"
                        type="primary"
                        onClick={handleCreateRoom}
                        size="large"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                        }}
                    >
                        Create Room
                    </Button>
                ]}
                width={520}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        topic: selected ? `Introduction: ${selected.projectName}` : '',
                        meetingTime: null,
                        description: ""
                    }}
                    requiredMark="optional"
                >
                    <Form.Item
                        name="topic"
                        label="Meeting Topic"
                        rules={[{ required: true, message: 'Please input meeting topic' }]}
                    >
                        <Input
                            size="large"
                            placeholder="Enter meeting topic..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="meetingTime"
                        label="Meeting Time"
                        rules={[{ required: true, message: 'Please select meeting time' }]}
                    >
                        <DatePicker
                            showTime={{
                                format: 'HH:mm',
                                minuteStep: 15,
                                showNow: true
                            }}
                            format="YYYY-MM-DD HH:mm"
                            style={{ width: '100%' }}
                            size="large"
                            disabledDate={(current) => {
                                return current && current.valueOf() < Date.now();
                            }}
                            placeholder="Select date and time"
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Additional Notes"
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Enter any additional information about the meeting..."
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FindProjects;