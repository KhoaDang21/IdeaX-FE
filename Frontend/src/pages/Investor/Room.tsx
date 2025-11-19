import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchMeetings, signMeetingNda, joinMeeting, type MeetingStatus } from "../../services/features/meeting/meetingSlice";
import { fetchNdaTemplates, signNda } from "../../services/features/nda/ndaSlice";
import { getAccountById } from "../../services/features/auth/accountService";
import api from "../../services/constant/axiosInstance";
import { getStartupProfile, getInvestorProfile } from "../../services/features/auth/authSlice";
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
    Modal,
    Descriptions,
} from "antd";
import InlineLoading from '../../components/InlineLoading'
import {
    VideoCameraOutlined,
    CalendarOutlined,
    UserOutlined,
    GlobalOutlined,
    FileTextOutlined,
    EditOutlined,
    MailOutlined,
    ProjectOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Room: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const meetingsState = useSelector((s: RootState) => s.meeting);
    const ndaState = useSelector((s: RootState) => s.nda);
    const authUser = useSelector((s: RootState) => s.auth.user);

    // NDA modal states
    const [ndaModalVisible, setNdaModalVisible] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [currentSigningMeeting, setCurrentSigningMeeting] = useState<number | null>(null);
    const [ndaAgreeChecked, setNdaAgreeChecked] = useState(false);
    const [meetingDetails, setMeetingDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [ndaMode, setNdaMode] = useState<'sign' | 'view'>('sign');
    const [currentMeetingRecord, setCurrentMeetingRecord] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchMeetings() as any).catch(() => { });
    }, [dispatch]);

    const handleJoin = async (meetingId: number) => {
        if (!authUser) {
            message.error("Please log in to join the meeting");
            return;
        }

        try {
            const url = await dispatch(joinMeeting({ meetingId, userId: Number(authUser.id) })).unwrap();
            if (url) {
                window.open(url, "_blank");
            } else {
                message.error("Unable to retrieve join link");
            }
        } catch (err: any) {
            message.error(err.response?.data || err.message || "Error retrieving join link");
        }
    };

    const loadMeetingDetails = async (meeting: any) => {
        if (!meeting) return;

        setLoadingDetails(true);
        try {
            // Prefer meeting-provided fields populated by backend (no admin required)
            const investorFullNameFromMeeting = meeting.investorFullName || meeting.createdByName;
            const investorEmailFromMeeting = meeting.investorEmail || meeting.createdByEmail;
            const startupFullNameFromMeeting = meeting.startupFullName || meeting.startupName;
            const startupEmailFromMeeting = meeting.startupEmail;

            let investorFullName = investorFullNameFromMeeting || 'N/A';
            let investorEmail = investorEmailFromMeeting || 'N/A';
            let startupFullName = startupFullNameFromMeeting || 'N/A';
            let startupEmail = startupEmailFromMeeting || 'N/A';

            // If some info is still missing, try legacy endpoints as a fallback (may require proper permissions)
            if ((!investorEmail || investorEmail === 'N/A') && meeting.createdById) {
                try {
                    const investorAccount = await getAccountById(meeting.createdById.toString());
                    investorEmail = investorAccount.email || investorEmail;
                } catch (error) {
                    // ignore — will show N/A
                }
            }

            if ((startupEmail === 'N/A' || !startupEmail) && meeting.startupId) {
                try {
                    const startupAccount = await getAccountById(meeting.startupId.toString());
                    startupEmail = startupAccount.email || startupEmail;
                } catch (error) {
                    // ignore
                }
            }

            // If full names still missing, try profile endpoints as last resort
            if ((investorFullName === 'N/A' || !investorFullName) && meeting.createdById) {
                try {
                    const investorProfile = await dispatch(getInvestorProfile(meeting.createdById.toString())).unwrap();
                    investorFullName = investorProfile.fullName || investorFullName;
                } catch (error) {
                    // ignore
                }
            }

            if ((startupFullName === 'N/A' || !startupFullName) && meeting.startupId) {
                try {
                    const startupProfile = await dispatch(getStartupProfile(meeting.startupId.toString())).unwrap();
                    startupFullName = startupProfile.fullName || startupFullName;
                } catch (error) {
                    // ignore
                }
            }

            setMeetingDetails({
                projectName: meeting.projectName || 'N/A',
                startupFullName,
                startupEmail,
                investorFullName,
                investorEmail
            });
        } catch (error) {
            console.error('Error loading meeting details:', error);
            message.error('Error loading meeting details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSignNDA = async (meetingId: number, meeting: any) => {
        if (!authUser) {
            message.error("Please log in to sign the NDA");
            return;
        }

        try {
            const templates = await dispatch(fetchNdaTemplates()).unwrap();
            if (!templates || templates.length === 0) {
                message.error("No NDA template available. Please contact admin to upload.");
                return;
            }

            const latest = templates[templates.length - 1];
            setSelectedTemplate(latest);
            setCurrentSigningMeeting(meetingId);

            // Fetch fresh meeting record to ensure NDA flags are current
            try {
                const res = await api.get(`/api/meetings/${meetingId}`);
                const freshMeeting = res.data;
                setCurrentMeetingRecord(freshMeeting);
                const investorSigned = !!freshMeeting.investorNdaSigned;
                const bothSigned = !!freshMeeting.investorNdaSigned && !!freshMeeting.startupNdaSigned;
                if (bothSigned) {
                    setNdaMode('view');
                    setNdaAgreeChecked(true);
                } else if (investorSigned) {
                    setNdaMode('view');
                    setNdaAgreeChecked(true);
                } else {
                    setNdaMode('sign');
                    setNdaAgreeChecked(false);
                }
                await loadMeetingDetails(freshMeeting);
                setNdaModalVisible(true);
            } catch (err) {
                setCurrentMeetingRecord(meeting);
                const investorSigned = !!meeting.investorNdaSigned;
                if (investorSigned) {
                    setNdaMode('view');
                    setNdaAgreeChecked(true);
                } else {
                    setNdaMode('sign');
                    setNdaAgreeChecked(false);
                }
                await loadMeetingDetails(meeting);
                setNdaModalVisible(true);
            }
        } catch (err: any) {
            message.error(err?.message || err.response?.data || "Error loading NDA template");
        }
    };

    const confirmSignFromModal = async () => {
        if (!currentSigningMeeting || !authUser || !selectedTemplate) return;
        // If in view mode, just close
        if (ndaMode === 'view') {
            handleModalClose();
            return;
        }
        if (!ndaAgreeChecked) {
            message.error("Please agree to the terms before signing the NDA");
            return;
        }

        try {
            // 1) Sign the NDA template (create NdaAgreement)
            await dispatch(signNda({ userId: Number(authUser.id), ndaTemplateId: selectedTemplate.id })).unwrap();

            // 2) Mark meeting participant as signed (meeting-level)
            await dispatch(signMeetingNda({ meetingId: currentSigningMeeting, userId: Number(authUser.id) })).unwrap();

            message.success("NDA signed successfully!");
            setNdaModalVisible(false);
            setSelectedTemplate(null);
            setCurrentSigningMeeting(null);
            setNdaAgreeChecked(false);
            setMeetingDetails(null);
            dispatch(fetchMeetings() as any);
        } catch (err: any) {
            message.error(err.response?.data || err?.message || "Error signing NDA");
        }
    };

    const getStatusTag = (status?: MeetingStatus) => {
        switch (status) {
            case "PENDING":
                return <Tag color="orange">Pending Confirmation</Tag>;
            case "WAITING_NDA":
                return <Tag color="blue">Waiting for NDA</Tag>;
            case "CONFIRMED":
                return <Tag color="green">Confirmed</Tag>;
            default:
                return <Tag>Unknown</Tag>;
        }
    };

    const handleModalClose = () => {
        setNdaModalVisible(false);
        setSelectedTemplate(null);
        setCurrentSigningMeeting(null);
        setNdaAgreeChecked(false);
        setMeetingDetails(null);
    };

    return (
        <>
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
                {meetingsState.loading ? (
                    <InlineLoading />
                ) : meetingsState.meetings.length === 0 ? (
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

                                        {/* Status */}
                                        <div style={{ marginTop: 8 }}>
                                            {getStatusTag(m.status)}
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
                                                        {new Date(m.meetingTime).toLocaleString("en-US", {
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
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 10,
                                            marginTop: 14,
                                        }}
                                    >
                                        {/* Nút ký hoặc xem NDA */}
                                        {(m.investorNdaSigned || (m.status === "WAITING_NDA" && m.investorStatus !== "CONFIRMED")) && (
                                            <Button
                                                icon={<EditOutlined />}
                                                onClick={() => handleSignNDA(m.id, m)}
                                                style={{
                                                    flex: 1,
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
                                                {m.investorNdaSigned ? "View NDA" : "Sign NDA"}
                                            </Button>
                                        )}

                                        {/* Nút join meeting */}
                                        <Button
                                            type="primary"
                                            icon={<VideoCameraOutlined />}
                                            onClick={() => handleJoin(m.id)}
                                            disabled={m.status !== "CONFIRMED"}
                                            style={{
                                                flex: 1,
                                                height: 38,
                                                borderRadius: 8,
                                                fontWeight: 600,
                                                fontSize: 13.5,
                                                background:
                                                    m.status === "CONFIRMED"
                                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                        : "#d9d9d9",
                                                border: "none",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 6,
                                            }}
                                        >
                                            {m.status === "CONFIRMED" ? "Join Meeting" : "Unavailable"}
                                        </Button>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </div>

            {/* NDA Preview Modal */}
            <Modal
                title="NDA & Meeting Information"
                open={ndaModalVisible}
                onOk={ndaMode === 'sign' ? confirmSignFromModal : handleModalClose}
                onCancel={handleModalClose}
                width={700}
                okText={ndaMode === 'sign' ? "Sign NDA" : "Close"}
                cancelText="Cancel"
                confirmLoading={ndaState.loading}
                okButtonProps={{ disabled: ndaMode === 'sign' ? (!ndaAgreeChecked || ndaState.loading) : false }}
            >
                {loadingDetails ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <InlineLoading message="Loading meeting details..." />
                    </div>
                ) : (
                    <div style={{ minHeight: 120 }}>
                        {/* Thông tin meeting */}
                        <Descriptions
                            title="Meeting Information"
                            bordered
                            column={1}
                            size="small"
                            style={{ marginBottom: 20 }}
                        >
                            <Descriptions.Item label={<span><ProjectOutlined /> Name Project</span>}>
                                {meetingDetails?.projectName || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label={<span><UserOutlined /> Fullname Startup</span>}>
                                {meetingDetails?.startupFullName || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label={<span><MailOutlined /> Email Startup</span>}>
                                {meetingDetails?.startupEmail || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label={<span><UserOutlined /> Fullname Investor</span>}>
                                {meetingDetails?.investorFullName || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label={<span><MailOutlined /> Email Investor</span>}>
                                {meetingDetails?.investorEmail || 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* NDA Content Preview */}
                        <div style={{
                            border: '1px solid #d9d9d9',
                            borderRadius: 6,
                            padding: 16,
                            backgroundColor: '#fafafa',
                            marginBottom: 16
                        }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                NDA Content:
                            </Text>
                            <Text type="secondary">
                                {selectedTemplate?.description ||
                                    "By signing this NDA, both parties agree to keep confidential any information shared during the meeting. All communications, documents, ideas, and data are considered confidential and must not be disclosed to third parties without written consent."}
                            </Text>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={ndaAgreeChecked}
                                    onChange={(e) => setNdaAgreeChecked(e.target.checked)}
                                    disabled={ndaMode === 'view'}
                                    style={{ marginTop: 3 }}
                                />
                                <span>
                                    I have read, understand, and agree to all terms in this Non-Disclosure Agreement (NDA). I commit to complying with the confidentiality rules set forth in the document.
                                </span>
                            </label>
                            <div style={{ marginTop: 10 }}>
                                {currentMeetingRecord?.investorNdaSigned && currentMeetingRecord?.startupNdaSigned ? (
                                    <Text type="success">Both parties have signed the NDA and accepted the terms. The meeting is confirmed. You can join the meeting.</Text>
                                ) : (
                                    <Text type="warning">Waiting for the other party to sign the NDA.</Text>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Room;