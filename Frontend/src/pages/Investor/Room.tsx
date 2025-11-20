import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
  fetchMeetings,
  signMeetingNda,
  joinMeeting,
  type MeetingStatus,
  type Meeting,
} from "../../services/features/meeting/meetingSlice";
import {
  fetchNdaTemplates,
  signNda,
} from "../../services/features/nda/ndaSlice";
import {
  fetchContractByMeeting,
  clearContract,
} from "../../services/features/contract/contractSlice";
import { getAccountById } from "../../services/features/auth/accountService";
import api from "../../services/constant/axiosInstance";
import {
  getStartupProfile,
  getInvestorProfile,
} from "../../services/features/auth/authSlice";
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
  Radio, // <-- NEW
  type RadioChangeEvent, // <-- NEW
} from "antd";
import InlineLoading from "../../components/InlineLoading";
import MeetingContractModal from "../../components/meeting/MeetingContractModal";
import {
  VideoCameraOutlined,
  CalendarOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
  EditOutlined,
  MailOutlined,
  ProjectOutlined,
  WalletOutlined, // <-- NEW
  CreditCardOutlined, // <-- NEW
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
  const [currentSigningMeeting, setCurrentSigningMeeting] = useState<
    number | null
  >(null);
  const [ndaAgreeChecked, setNdaAgreeChecked] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [ndaMode, setNdaMode] = useState<"sign" | "view">("sign");
  const [currentMeetingRecord, setCurrentMeetingRecord] = useState<any>(null);
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [contractMeeting, setContractMeeting] = useState<Meeting | null>(null);

  // --- PAYMENT STATES ---
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "PAYOS">(
    "WALLET"
  );
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    dispatch(fetchMeetings() as any).catch(() => {});
  }, [dispatch]);

  // --- LOGIC THANH TOÁN & KÝ ---

  // Hàm thực hiện ký (Gọi sau khi thanh toán thành công)
  const executeSignNdaLogic = async (
    meetingIdParam?: number,
    templateIdParam?: number,
    userIdParam?: number
  ) => {
    const mId = meetingIdParam || currentSigningMeeting;
    const tId = templateIdParam || selectedTemplate?.id;
    const uId = userIdParam || (authUser ? Number(authUser.id) : null);

    if (!mId || !tId || !uId) return;

    try {
      // 1. Ký template
      await dispatch(signNda({ userId: uId, ndaTemplateId: tId })).unwrap();
      // 2. Cập nhật trạng thái meeting
      await dispatch(signMeetingNda({ meetingId: mId, userId: uId })).unwrap();

      message.success("Thanh toán và Ký NDA thành công!");

      // Reset states
      setPaymentModalVisible(false);
      setSelectedTemplate(null);
      setCurrentSigningMeeting(null);
      setNdaAgreeChecked(false);
      setMeetingDetails(null);

      // Refresh data
      dispatch(fetchMeetings() as any);
    } catch (err: any) {
      console.error(err);
      message.error(
        "Đã thanh toán nhưng lỗi khi ký (Transaction recorded). Vui lòng liên hệ Admin."
      );
    }
  };

  // Xử lý thanh toán
  const handlePaymentAndSign = async () => {
    setProcessingPayment(true);
    try {
      if (paymentMethod === "WALLET") {
        // Cách 1: Trừ ví
        await api.post("/api/payments/nda/pay-wallet", {
          meetingId: currentSigningMeeting,
        });
        message.success("Đã trừ 150,000 VND từ ví.");
        await executeSignNdaLogic();
      } else {
        // Cách 2: PayOS - Gọi API deposit chuẩn
        const res = await api.post("/api/payments/wallet/deposit", {
          amount: 150000,
          paymentMethod: "PAYOS",
        });

        if (res.data && res.data.paymentUrl) {
          // Lưu data tạm vào localStorage
          localStorage.setItem(
            "pending_nda_sign_investor",
            JSON.stringify({
              meetingId: currentSigningMeeting,
              templateId: selectedTemplate?.id,
              userId: authUser?.id,
            })
          );
          // Redirect
          window.location.href = res.data.paymentUrl;
        }
      }
    } catch (err: any) {
      message.error(
        err.response?.data || "Thanh toán thất bại. Kiểm tra số dư ví."
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  // Check PayOS Return (Callback)
  useEffect(() => {
    const checkPayOsReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ndaMeetingId = urlParams.get("nda_meeting_id");

      const pendingDataStr = localStorage.getItem("pending_nda_sign_investor");

      if (ndaMeetingId && pendingDataStr) {
        const pendingData = JSON.parse(pendingDataStr);

        if (Number(ndaMeetingId) === pendingData.meetingId) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          message.loading("Đang xác nhận thanh toán...", 1.5);
          await executeSignNdaLogic(
            pendingData.meetingId,
            pendingData.templateId,
            pendingData.userId
          );
        }
        localStorage.removeItem("pending_nda_sign_investor");
      }
    };
    checkPayOsReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // --- END LOGIC THANH TOÁN ---

  const handleOpenContract = async (meeting: Meeting) => {
    if (!authUser) {
      message.error("Vui lòng đăng nhập để xem hợp đồng");
      return;
    }
    if (!meeting.ndaCompleted) {
      message.warning("Cần hoàn tất NDA của cả hai bên trước khi ký hợp đồng.");
      return;
    }
    setContractMeeting(meeting);
    setContractModalVisible(true);
    try {
      await dispatch(
        fetchContractByMeeting({
          meetingId: meeting.id,
          userId: authUser ? Number(authUser.id) : undefined,
        })
      ).unwrap();
    } catch (err: any) {
      message.error(
        err?.message || err.response?.data || "Không thể tải hợp đồng"
      );
      setContractModalVisible(false);
    }
  };

  const handleContractModalClose = () => {
    setContractModalVisible(false);
    setContractMeeting(null);
    dispatch(clearContract());
  };

  const handleJoin = async (meetingId: number) => {
    if (!authUser) {
      message.error("Please log in to join the meeting");
      return;
    }

    try {
      const url = await dispatch(
        joinMeeting({ meetingId, userId: Number(authUser.id) })
      ).unwrap();
      if (url) {
        window.open(url, "_blank");
      } else {
        message.error("Unable to retrieve join link");
      }
    } catch (err: any) {
      message.error(
        err.response?.data || err.message || "Error retrieving join link"
      );
    }
  };

  const loadMeetingDetails = async (meeting: any) => {
    if (!meeting) return;

    setLoadingDetails(true);
    try {
      const investorFullNameFromMeeting =
        meeting.investorFullName || meeting.createdByName;
      const investorEmailFromMeeting =
        meeting.investorEmail || meeting.createdByEmail;
      const startupFullNameFromMeeting =
        meeting.startupFullName || meeting.startupName;
      const startupEmailFromMeeting = meeting.startupEmail;

      let investorFullName = investorFullNameFromMeeting || "N/A";
      let investorEmail = investorEmailFromMeeting || "N/A";
      let startupFullName = startupFullNameFromMeeting || "N/A";
      let startupEmail = startupEmailFromMeeting || "N/A";

      if ((!investorEmail || investorEmail === "N/A") && meeting.createdById) {
        try {
          const investorAccount = await getAccountById(
            meeting.createdById.toString()
          );
          investorEmail = investorAccount.email || investorEmail;
        } catch (error) {}
      }

      if ((startupEmail === "N/A" || !startupEmail) && meeting.startupId) {
        try {
          const startupAccount = await getAccountById(
            meeting.startupId.toString()
          );
          startupEmail = startupAccount.email || startupEmail;
        } catch (error) {}
      }

      if (
        (investorFullName === "N/A" || !investorFullName) &&
        meeting.createdById
      ) {
        try {
          const investorProfile = await dispatch(
            getInvestorProfile(meeting.createdById.toString())
          ).unwrap();
          investorFullName = investorProfile.fullName || investorFullName;
        } catch (error) {}
      }

      if (
        (startupFullName === "N/A" || !startupFullName) &&
        meeting.startupId
      ) {
        try {
          const startupProfile = await dispatch(
            getStartupProfile(meeting.startupId.toString())
          ).unwrap();
          startupFullName = startupProfile.fullName || startupFullName;
        } catch (error) {}
      }

      setMeetingDetails({
        projectName: meeting.projectName || "N/A",
        startupFullName,
        startupEmail,
        investorFullName,
        investorEmail,
      });
    } catch (error) {
      console.error("Error loading meeting details:", error);
      message.error("Error loading meeting details");
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
        message.error(
          "No NDA template available. Please contact admin to upload."
        );
        return;
      }

      const latest = templates[templates.length - 1];
      setSelectedTemplate(latest);
      setCurrentSigningMeeting(meetingId);

      try {
        const res = await api.get(`/api/meetings/${meetingId}`);
        const freshMeeting = res.data;
        setCurrentMeetingRecord(freshMeeting);
        const investorSigned = !!freshMeeting.investorNdaSigned;
        const bothSigned =
          !!freshMeeting.investorNdaSigned && !!freshMeeting.startupNdaSigned;
        if (bothSigned) {
          setNdaMode("view");
          setNdaAgreeChecked(true);
        } else if (investorSigned) {
          setNdaMode("view");
          setNdaAgreeChecked(true);
        } else {
          setNdaMode("sign");
          setNdaAgreeChecked(false);
        }
        await loadMeetingDetails(freshMeeting);
        setNdaModalVisible(true);
      } catch (err) {
        setCurrentMeetingRecord(meeting);
        const investorSigned = !!meeting.investorNdaSigned;
        if (investorSigned) {
          setNdaMode("view");
          setNdaAgreeChecked(true);
        } else {
          setNdaMode("sign");
          setNdaAgreeChecked(false);
        }
        await loadMeetingDetails(meeting);
        setNdaModalVisible(true);
      }
    } catch (err: any) {
      message.error(
        err?.message || err.response?.data || "Error loading NDA template"
      );
    }
  };

  const confirmSignFromModal = async () => {
    if (!currentSigningMeeting || !authUser || !selectedTemplate) return;
    if (ndaMode === "view") {
      handleModalClose();
      return;
    }
    if (!ndaAgreeChecked) {
      message.error("Please agree to the terms before signing the NDA");
      return;
    }

    // --- CHUYỂN HƯỚNG SANG MODAL THANH TOÁN ---
    setNdaModalVisible(false);
    setPaymentModalVisible(true);
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
          padding: "16px 12px",
          background: "linear-gradient(135deg, #f5f7fa 0%, #eaeef5 100%)",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        {/* Header Section */}
        <div
          style={{
            background: "white",
            padding: "20px 24px",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            marginBottom: 20,
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
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  />
                  <Title
                    level={3}
                    style={{
                      margin: 0,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                  <Space
                    direction="vertical"
                    size={10}
                    style={{ width: "100%" }}
                  >
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
                    <div style={{ marginTop: 8 }}>{getStatusTag(m.status)}</div>

                    {/* Details */}
                    <Divider style={{ margin: "8px 0" }} />

                    <Space
                      direction="vertical"
                      size={6}
                      style={{ width: "100%" }}
                    >
                      <Row gutter={6} align="middle">
                        <Col flex="18px">
                          <CalendarOutlined
                            style={{ color: "#1890ff", fontSize: 13 }}
                          />
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
                          <UserOutlined
                            style={{ color: "#52c41a", fontSize: 13 }}
                          />
                        </Col>
                        <Col flex="auto">
                          <Text style={{ fontSize: 13 }}>
                            {m.createdByName || "Unknown"}
                          </Text>
                        </Col>
                      </Row>

                      {m.projectName && (
                        <Row gutter={6} align="middle">
                          <Col flex="18px">
                            <GlobalOutlined
                              style={{ color: "#722ed1", fontSize: 13 }}
                            />
                          </Col>
                          <Col flex="auto">
                            <Text style={{ fontSize: 13 }}>
                              {m.projectName}
                            </Text>
                          </Col>
                        </Row>
                      )}
                    </Space>

                    {/* Description with icon */}
                    {m.description && (
                      <Row gutter={6} align="middle" style={{ marginTop: 6 }}>
                        <Col flex="18px">
                          <FileTextOutlined
                            style={{ color: "#fa8c16", fontSize: 13 }}
                          />
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
                      alignItems: "stretch",
                      flexWrap: "wrap",
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    {(m.investorNdaSigned ||
                      (m.status === "WAITING_NDA" &&
                        m.investorStatus !== "CONFIRMED")) && (
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

                    {m.ndaCompleted &&
                      authUser?.role === "investor" &&
                      (() => {
                        const fully = m.contractStatus === "FULLY_SIGNED";
                        if (fully) {
                          return (
                            <Button
                              icon={<FileTextOutlined />}
                              onClick={() => handleOpenContract(m)}
                              style={{
                                flex: 1,
                                minWidth: 140,
                                height: 38,
                                borderRadius: 8,
                                fontWeight: 500,
                                fontSize: 13.5,
                              }}
                            >
                              View Contract
                            </Button>
                          );
                        }
                        return (
                          <Button
                            icon={<FileTextOutlined />}
                            onClick={() => handleOpenContract(m)}
                            style={{
                              flex: 1,
                              minWidth: 140,
                              height: 38,
                              borderRadius: 8,
                              fontWeight: 500,
                              fontSize: 13.5,
                            }}
                          >
                            {m.investorContractSigned
                              ? "View Contract"
                              : "Sign Contract"}
                          </Button>
                        );
                      })()}

                    {m.ndaCompleted &&
                      authUser?.role === "startup" &&
                      (() => {
                        const fully = m.contractStatus === "FULLY_SIGNED";
                        if (fully) {
                          return (
                            <Button
                              icon={<FileTextOutlined />}
                              onClick={() => handleOpenContract(m)}
                              style={{
                                flex: 1,
                                minWidth: 140,
                                height: 38,
                                borderRadius: 8,
                                fontWeight: 500,
                                fontSize: 13.5,
                              }}
                            >
                              View Contract
                            </Button>
                          );
                        }

                        if (
                          m.investorContractSigned &&
                          !m.startupContractSigned
                        ) {
                          return (
                            <Button
                              icon={<FileTextOutlined />}
                              onClick={() => handleOpenContract(m)}
                              style={{
                                flex: 1,
                                minWidth: 140,
                                height: 38,
                                borderRadius: 8,
                                fontWeight: 500,
                                fontSize: 13.5,
                              }}
                            >
                              Ký hợp đồng
                            </Button>
                          );
                        }

                        return (
                          <Button
                            icon={<FileTextOutlined />}
                            disabled
                            style={{
                              flex: 1,
                              minWidth: 140,
                              height: 38,
                              borderRadius: 8,
                              fontWeight: 500,
                              fontSize: 13.5,
                            }}
                          >
                            Chờ nhà đầu tư
                          </Button>
                        );
                      })()}

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
                      {m.status === "CONFIRMED"
                        ? "Join Meeting"
                        : "Unavailable"}
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
        onOk={ndaMode === "sign" ? confirmSignFromModal : handleModalClose}
        onCancel={handleModalClose}
        width={700}
        okText={ndaMode === "sign" ? "Sign NDA" : "Close"}
        cancelText="Cancel"
        confirmLoading={ndaState.loading}
        okButtonProps={{
          disabled:
            ndaMode === "sign" ? !ndaAgreeChecked || ndaState.loading : false,
        }}
      >
        {loadingDetails ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <InlineLoading message="Loading meeting details..." />
          </div>
        ) : (
          <div style={{ minHeight: 120 }}>
            <Descriptions
              title="Meeting Information"
              bordered
              column={1}
              size="small"
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item
                label={
                  <span>
                    <ProjectOutlined /> Name Project
                  </span>
                }
              >
                {meetingDetails?.projectName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined /> Fullname Startup
                  </span>
                }
              >
                {meetingDetails?.startupFullName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined /> Email Startup
                  </span>
                }
              >
                {meetingDetails?.startupEmail || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined /> Fullname Investor
                  </span>
                }
              >
                {meetingDetails?.investorFullName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined /> Email Investor
                  </span>
                }
              >
                {meetingDetails?.investorEmail || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                padding: 16,
                backgroundColor: "#fafafa",
                marginBottom: 16,
              }}
            >
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                NDA Content:
              </Text>
              <Text type="secondary">
                {selectedTemplate?.description ||
                  "By signing this NDA, both parties agree to keep confidential any information shared during the meeting. All communications, documents, ideas, and data are considered confidential and must not be disclosed to third parties without written consent."}
              </Text>
            </div>

            <div style={{ marginTop: 12 }}>
              <label
                style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
              >
                <input
                  type="checkbox"
                  checked={ndaAgreeChecked}
                  onChange={(e) => setNdaAgreeChecked(e.target.checked)}
                  disabled={ndaMode === "view"}
                  style={{ marginTop: 3 }}
                />
                <span>
                  I have read, understand, and agree to all terms in this
                  Non-Disclosure Agreement (NDA). I commit to complying with the
                  confidentiality rules set forth in the document.
                </span>
              </label>
              <div style={{ marginTop: 10 }}>
                {currentMeetingRecord?.investorNdaSigned &&
                currentMeetingRecord?.startupNdaSigned ? (
                  <Text type="success">
                    Both parties have signed the NDA and accepted the terms. The
                    meeting is confirmed. You can join the meeting.
                  </Text>
                ) : (
                  <Text type="warning">
                    Waiting for the other party to sign the NDA.
                  </Text>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Payment for NDA Signing"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPaymentModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={processingPayment}
            onClick={handlePaymentAndSign}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
          >
            Confirm Payment (150,000 VND)
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div
            style={{
              background: "#fff1f0",
              padding: 12,
              borderRadius: 6,
              border: "1px solid #ffa39e",
            }}
          >
            <Text type="danger">
              To complete the NDA signing process, a fee of <b>150,000 VND</b>{" "}
              is required.
            </Text>
          </div>

          <Card
            size="small"
            title="Payment Method"
            bordered={false}
            style={{ background: "#f5f7fa" }}
          >
            <Radio.Group
              onChange={(e: RadioChangeEvent) =>
                setPaymentMethod(e.target.value)
              }
              value={paymentMethod}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <Radio value="WALLET">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <WalletOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>IdeaX Wallet</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Fast payment with balance
                    </div>
                  </div>
                </div>
              </Radio>
              <Radio value="PAYOS">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CreditCardOutlined
                    style={{ fontSize: 20, color: "#52c41a" }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>PayOS (Bank Transfer)</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      QR Code / ATM card
                    </div>
                  </div>
                </div>
              </Radio>
            </Radio.Group>
          </Card>
        </Space>
      </Modal>

      <MeetingContractModal
        open={contractModalVisible}
        meeting={contractMeeting}
        isInvestor={authUser?.role === "investor"}
        userId={authUser ? Number(authUser.id) : undefined}
        onCancel={handleContractModalClose}
        onAfterAction={() => dispatch(fetchMeetings() as any)}
      />
    </>
  );
};

export default Room;
