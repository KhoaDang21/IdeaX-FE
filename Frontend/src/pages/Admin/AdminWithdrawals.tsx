import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  Typography,
  Space,
  Modal,
  Input,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingWithdrawals,
  approveWithdraw,
  rejectWithdrawAdmin,
} from "../../services/features/payment/paymentSlice";
import type { AppDispatch, RootState } from "../../store";
import type { WithdrawRequestDetail } from "../../interfaces/payment";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminWithdrawals: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { pendingWithdrawalsPage, status } = useSelector(
    (state: RootState) => state.payment
  );

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  // Load dữ liệu khi vào trang
  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const fetchData = () => {
    dispatch(getPendingWithdrawals({ page: 0, size: 20 }));
  };

  // --- Xử lý Duyệt ---
  const handleOpenApprove = (id: number) => {
    setSelectedTransactionId(id);
    setAdminNote("Approved by Admin");
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedTransactionId) return;
    try {
      await dispatch(
        approveWithdraw({
          transactionId: selectedTransactionId,
          payload: {
            adminNote: adminNote,
            transactionRef: `REF-${Date.now()}`, // Mã tham chiếu ngân hàng giả lập
          },
        })
      ).unwrap();
      message.success("Withdrawal approved successfully");
      setApproveModalOpen(false);
      fetchData();
    } catch (error: any) {
      message.error(error || "Failed to approve");
    }
  };

  // --- Xử lý Từ chối ---
  const handleOpenReject = (id: number) => {
    setSelectedTransactionId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedTransactionId) return;
    if (!rejectReason.trim()) {
      message.error("Please enter a reason for rejection");
      return;
    }
    try {
      await dispatch(
        rejectWithdrawAdmin({
          transactionId: selectedTransactionId,
          payload: {
            reason: rejectReason,
          },
        })
      ).unwrap();
      message.success("Withdrawal rejected and refunded");
      setRejectModalOpen(false);
      fetchData();
    } catch (error: any) {
      message.error(error || "Failed to reject");
    }
  };

  const columns: ColumnsType<WithdrawRequestDetail> = [
    {
      title: "ID",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 60,
    },
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => (
        <Text strong style={{ color: "#d97706" }}>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(val)}
        </Text>
      ),
    },
    {
      title: "Bank Info",
      key: "bankInfo",
      render: (_, record) => (
        <div style={{ fontSize: 13 }}>
          <div>
            <strong>Bank:</strong> {record.bankName}
          </div>
          <div>
            <strong>Acc:</strong> {record.accountNumber}
          </div>
          <div>
            <strong>Name:</strong>{" "}
            <span style={{ color: "#1677ff" }}>{record.accountHolder}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "PENDING" ? "gold" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            style={{ backgroundColor: "#16a34a" }}
            onClick={() => handleOpenApprove(record.transactionId)}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleOpenReject(record.transactionId)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false}>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Withdrawal Requests
          </Title>
          <Button onClick={fetchData} loading={status === "loading"}>
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={pendingWithdrawalsPage?.content || []}
          rowKey="transactionId"
          loading={status === "loading"}
          pagination={{
            total: pendingWithdrawalsPage?.totalElements || 0,
            pageSize: 20,
            current: (pendingWithdrawalsPage?.number || 0) + 1,
            onChange: (page) =>
              dispatch(getPendingWithdrawals({ page: page - 1, size: 20 })),
          }}
        />
      </Card>

      {/* Modal Reject */}
      <Modal
        title="Reject Withdrawal Request"
        open={rejectModalOpen}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="Confirm Reject"
        okButtonProps={{ danger: true }}
      >
        <p>
          Please provide a reason for rejecting this request. The money will be
          refunded to the user's wallet.
        </p>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection..."
        />
      </Modal>

      {/* Modal Approve */}
      <Modal
        title="Approve Withdrawal"
        open={approveModalOpen}
        onOk={handleConfirmApprove}
        onCancel={() => setApproveModalOpen(false)}
        okText="Confirm Transfer"
      >
        <p>
          Are you sure you want to approve this request? This action cannot be
          undone.
        </p>
        <div style={{ marginBottom: 8 }}>Admin Note (Optional):</div>
        <Input
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="e.g., Transfer completed via Vietcombank"
        />
      </Modal>
    </div>
  );
};

export default AdminWithdrawals;
