import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
  fetchMeetingsByStartup,
  confirmMeeting,
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
  Radio, // <-- NEW
  type RadioChangeEvent, // <-- NEW
} from "antd";
import InlineLoading from "../../components/InlineLoading";
import MeetingContractModal from "../../components/meeting/MeetingContractModal";
import {
  VideoCameraOutlined,
  EditOutlined,
  CheckOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  ProjectOutlined,
  FileTextOutlined,
  WalletOutlined, // <-- NEW
  CreditCardOutlined, // <-- NEW
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Roommeet: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const meetingsState = useSelector((s: RootState) => s.meeting);
  const ndaState = useSelector((s: RootState) => s.nda);
  const authUser = useSelector((s: RootState) => s.auth.user);

  // For startup role: fetch meetings by startup id
  useEffect(() => {
    if (authUser?.id) {
      dispatch(fetchMeetingsByStartup(Number(authUser.id)) as any).catch(
        () => {}
      );
    }
  }, [dispatch, authUser]);

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

  // --- LOGIC THANH TOÁN ---

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
      await dispatch(signNda({ userId: uId, ndaTemplateId: tId })).unwrap();
      await dispatch(signMeetingNda({ meetingId: mId, userId: uId })).unwrap();

      message.success("Thanh toán và Ký NDA thành công!");

      setPaymentModalVisible(false);
      setSelectedTemplate(null);
      setCurrentSigningMeeting(null);
      setNdaAgreeChecked(false);
      setMeetingDetails(null);

      if (authUser?.id) {
        dispatch(fetchMeetingsByStartup(Number(authUser.id)) as any).catch(
          () => {}
        );
      }
    } catch (err: any) {
      console.error(err);
      message.error("Đã thanh toán nhưng lỗi khi ký. Vui lòng liên hệ Admin.");
    }
  };

  const handlePaymentAndSign = async () => {
    setProcessingPayment(true);
    try {
      if (paymentMethod === "WALLET") {
        await api.post("/api/payments/nda/pay-wallet", {
          meetingId: currentSigningMeeting,
        });
        message.success("Đã trừ 150,000 VND từ ví.");
        await executeSignNdaLogic();
      } else {
        const res = await api.post("/api/payments/nda/create-payos", {
          meetingId: currentSigningMeeting,
        });

        if (res.data && res.data.paymentUrl) {
          localStorage.setItem(
            "pending_nda_sign_startup",
            JSON.stringify({
              meetingId: currentSigningMeeting,
              templateId: selectedTemplate?.id,
              userId: authUser?.id,
            })
          );
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

  useEffect(() => {
    const checkPayOsReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ndaMeetingId = urlParams.get("nda_meeting_id");
      const pendingDataStr = localStorage.getItem("pending_nda_sign_startup");

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
        localStorage.removeItem("pending_nda_sign_startup");
      }
    };
    checkPayOsReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // --- END LOGIC THANH TOÁN ---

  const handleConfirm = async (meetingId: number) => {
    if (!authUser) {
      message.error("Please log in");
      return;
    }

    try {
      await dispatch(
        confirmMeeting({ meetingId, startupId: Number(authUser.id) })
      ).unwrap();
      message.success("Xác nhận meeting thành công!");
      dispatch(fetchMeetingsByStartup(Number(authUser.id)) as any).catch(
        () => {}
      );
    } catch (err: any) {
      message.error(err?.message || "Error confirming meeting");
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
      message.error("Please log in");
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
        const startupSigned = !!freshMeeting.startupNdaSigned;
        const bothSigned =
          !!freshMeeting.startupNdaSigned && !!freshMeeting.investorNdaSigned;
        if (bothSigned) {
          setNdaMode("view");
          setNdaAgreeChecked(true);
        } else if (startupSigned) {
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
        const startupSigned = !!meeting.startupNdaSigned;
        if (startupSigned) {
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

    // --- CHUYỂN HƯỚNG SANG PAYMENT ---
    setNdaModalVisible(false);
    setPaymentModalVisible(true);
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
        message.error("Không thể lấy link tham gia");
      }
    } catch (err: any) {
      message.error(
        err.response?.data || err.message || "Error retrieving join link"
      );
    }
  };

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
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 110 }}>
            {record.status === "PENDING" ? (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleConfirm(record.id)}
                style={{ width: "100%" }}
              >
                Confirm
              </Button>
            ) : (
              <Button
                icon={<EditOutlined />}
                onClick={() => handleSignNDA(record.id, record)}
                style={{ width: "100%" }}
              >
                {record.startupNdaSigned ? "View NDA" : "Sign NDA"}
              </Button>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 140 }}>
            {record.ndaCompleted ? (
              record.contractStatus === "FULLY_SIGNED" ? (
                <Button
                  icon={<FileTextOutlined />}
                  onClick={() => handleOpenContract(record)}
                  style={{ width: "100%" }}
                >
                  View Contract
                </Button>
              ) : record.investorContractSigned &&
                !record.startupContractSigned ? (
                <Button
                  icon={<FileTextOutlined />}
                  onClick={() => handleOpenContract(record)}
                  style={{ width: "100%" }}
                >
                  Ký hợp đồng
                </Button>
              ) : (
                <Button
                  icon={<FileTextOutlined />}
                  disabled
                  style={{ width: "100%" }}
                >
                  Chờ nhà đầu tư
                </Button>
              )
            ) : (
              <Button
                icon={<FileTextOutlined />}
                disabled
                style={{ width: "100%" }}
              >
                Contract
              </Button>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 120 }}>
            <Button
              type="primary"
              icon={<VideoCameraOutlined />}
              onClick={() => handleJoin(record.id)}
              disabled={record.status !== "CONFIRMED"}
              style={{
                width: "100%",
                background:
                  record.status === "CONFIRMED"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#d9d9d9",
                border: "none",
              }}
            >
              {record.status === "CONFIRMED" ? "Join Meeting" : "Unavailable"}
            </Button>
          </div>
        </div>
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
                  style={{ marginTop: 3 }}
                  disabled={ndaMode === "view"}
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
        title="Thanh toán phí ký NDA"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPaymentModalVisible(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={processingPayment}
            onClick={handlePaymentAndSign}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              fontWeight: 600,
            }}
          >
            Thanh toán 150,000 VND
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div
            style={{
              background: "#fff1f0",
              padding: 12,
              borderRadius: 6,
              border: "1px solid #ffa39e",
            }}
          >
            <Text type="danger">
              Để đảm bảo tính cam kết, bạn cần thanh toán phí hồ sơ NDA là{" "}
              <b>150,000 VND</b>.
            </Text>
          </div>

          <Card
            size="small"
            title="Phương thức thanh toán"
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
                    <div style={{ fontWeight: 500 }}>Ví IdeaX</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Thanh toán nhanh bằng số dư ví
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
                    <div style={{ fontWeight: 500 }}>Chuyển khoản (PayOS)</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Quét mã QR ngân hàng
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
        isInvestor={false}
        userId={authUser ? Number(authUser.id) : undefined}
        onCancel={handleContractModalClose}
        onAfterAction={() =>
          authUser &&
          dispatch(fetchMeetingsByStartup(Number(authUser.id)) as any)
        }
      />
    </div>
  );
};

export default Roommeet;
