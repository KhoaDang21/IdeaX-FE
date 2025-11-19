import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
  fetchMeetingsByStartup,
  confirmMeeting,
  signMeetingNda,
  joinMeeting,
  type MeetingStatus,
} from "../../services/features/meeting/meetingSlice";
import { fetchNdaTemplates, signNda } from "../../services/features/nda/ndaSlice";
import { getAccountById } from "../../services/features/auth/accountService";
import api from "../../services/constant/axiosInstance";
import { getStartupProfile, getInvestorProfile } from "../../services/features/auth/authSlice";
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  message,
  Empty,
  Card,
  Modal,
  Descriptions,
} from "antd";
import InlineLoading from '../../components/InlineLoading'
import {
  VideoCameraOutlined,
  EditOutlined,
  CheckOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  ProjectOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Roommeet: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const meetingsState = useSelector((s: RootState) => s.meeting);
  const ndaState = useSelector((s: RootState) => s.nda);
  const authUser = useSelector((s: RootState) => s.auth.user);

  // For startup role: fetch meetings by startup id (backend provides this endpoint)
  useEffect(() => {
    if (authUser?.id) {
      dispatch(fetchMeetingsByStartup(Number(authUser.id)) as any).catch(() => { });
    }
  }, [dispatch, authUser]);

  const [ndaModalVisible, setNdaModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [currentSigningMeeting, setCurrentSigningMeeting] = useState<number | null>(null);
  const [ndaAgreeChecked, setNdaAgreeChecked] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  // Mode for NDA modal: 'sign' => allow signing; 'view' => readonly view of NDA
  const [ndaMode, setNdaMode] = useState<'sign' | 'view'>('sign');
  // Keep the raw meeting record used to determine per-meeting NDA flags
  const [currentMeetingRecord, setCurrentMeetingRecord] = useState<any>(null);

  const handleConfirm = async (meetingId: number) => {
    if (!authUser) {
      message.error("Please log in");
      return;
    }

    try {
      await dispatch(confirmMeeting({ meetingId, startupId: Number(authUser.id) })).unwrap();
      message.success("Xác nhận meeting thành công!");
      // Refresh meetings for startup
      dispatch(fetchMeetingsByStartup(Number(authUser.id)) as any).catch(() => { });
    } catch (err: any) {
      message.error(err?.message || "Error confirming meeting");
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
      message.error("Please log in");
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

      // Fetch fresh meeting record from backend to ensure flags are up-to-date
      try {
        const res = await api.get(`/api/meetings/${meetingId}`);
        const freshMeeting = res.data;
        setCurrentMeetingRecord(freshMeeting);
        const startupSigned = !!freshMeeting.startupNdaSigned;
        const bothSigned = !!freshMeeting.startupNdaSigned && !!freshMeeting.investorNdaSigned;
        if (bothSigned) {
          setNdaMode('view');
          setNdaAgreeChecked(true);
        } else if (startupSigned) {
          // startup already signed, show view but note waiting for other
          setNdaMode('view');
          setNdaAgreeChecked(true);
        } else {
          setNdaMode('sign');
          setNdaAgreeChecked(false);
        }

        // Load meeting details before showing modal
        await loadMeetingDetails(freshMeeting);
        setNdaModalVisible(true);
      } catch (err) {
        // fallback to provided meeting object
        setCurrentMeetingRecord(meeting);
        const startupSigned = !!meeting.startupNdaSigned;
        if (startupSigned) {
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
      // 1) đảm bảo NdaAgreement tồn tại
      await dispatch(signNda({ userId: Number(authUser.id), ndaTemplateId: selectedTemplate.id })).unwrap();

      // 2) gọi meeting sign
      await dispatch(signMeetingNda({ meetingId: currentSigningMeeting, userId: Number(authUser.id) })).unwrap();

      message.success("NDA signed successfully!");
      setNdaModalVisible(false);
      setSelectedTemplate(null);
      setCurrentSigningMeeting(null);
      setNdaAgreeChecked(false);
      setMeetingDetails(null);
      dispatch(fetchMeetingsByStartup(Number(authUser.id)) as any).catch(() => { });
    } catch (err: any) {
      message.error(err.response?.data || err?.message || "Error signing NDA");
    }
  };

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
        message.error("Không thể lấy link tham gia");
      }
    } catch (err: any) {
      message.error(err.response?.data || err.message || "Error retrieving join link");
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
              Confirm
            </Button>
          )}
          {(record.startupNdaSigned || (record.status === "WAITING_NDA" && record.startupStatus !== "CONFIRMED")) && (
            record.startupNdaSigned ? (
              <Button
                icon={<EditOutlined />}
                onClick={() => handleSignNDA(record.id, record)}
              >
                View NDA
              </Button>
            ) : (
              <Button
                icon={<EditOutlined />}
                onClick={() => handleSignNDA(record.id, record)}
              >
                Sign NDA
              </Button>
            )
          )}
          {/* Sửa phần Join button để đồng bộ với Investor */}
          <Button
            type="primary"
            icon={<VideoCameraOutlined />}
            onClick={() => handleJoin(record.id)}
            disabled={record.status !== "CONFIRMED"}
            style={{
              background: record.status === "CONFIRMED"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#d9d9d9",
              border: "none",
            }}
          >
            {record.status === "CONFIRMED" ? "Join Meeting" : "Unavailable"}
          </Button>
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

        {meetingsState.loading ? (
          <InlineLoading />
        ) : meetingsState.meetings.length === 0 ? (
          <Empty description="No meetings found" />
        ) : (
          <Table
            columns={columns}
            dataSource={meetingsState.meetings}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

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
                  style={{ marginTop: 3 }}
                  disabled={ndaMode === 'view'}
                />
                <span>
                  I have read, understand, and agree to all terms in this Non-Disclosure Agreement (NDA). I commit to complying with the confidentiality rules set forth in the document.
                </span>
              </label>

              {/* Status helper text */}
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
    </div>
  );
};

export default Roommeet;