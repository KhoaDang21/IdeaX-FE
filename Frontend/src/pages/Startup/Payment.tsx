import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  message,
  Spin,
  Empty,
} from "antd";
import dayjs from "dayjs";

// Import từ store của bạn
import type { RootState, AppDispatch } from "../../store";
import {
  // --- SỬA ĐỔI IMPORT: Bỏ MoMo/ZaloPay, chỉ giữ createDeposit ---
  createDeposit,
  createWithdraw,
  getMyWallet,
  getTransactionHistory,
} from "../../services/features/payment/paymentSlice";

// --- Helper Functions ---
const formatCurrency = (value?: string | number) => {
  if (value === undefined || value === null) return "-";
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("vi-VN", {
    // Sửa thành "vi-VN"
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return dayjs(value).format("DD/MM/YYYY HH:mm");
};

const Payment: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { wallet, transactions, status } = useSelector(
    // Thêm 'status'
    (state: RootState) => state.payment
  );

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  // Bỏ 'loading' state, dùng 'status' từ slice
  // const [loading, setLoading] = useState(false);

  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    // setLoading(true); // Không cần state loading riêng
    try {
      await Promise.all([
        dispatch(getMyWallet()).unwrap(),
        dispatch(getTransactionHistory({ page: 0, size: 20 })).unwrap(),
      ]);
    } catch (error: any) {
      // Hiển thị lỗi nếu cần, nhưng slice đã lưu lỗi
      console.error("Failed to fetch payment data:", error.message);
    }
    // finally {
    //   setLoading(false);
    // }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- SỬA HÀM NẠP TIỀN ---
  const handleDepositSubmit = async () => {
    try {
      const values = await depositForm.validateFields();
      const amount = Number(values.amount);
      const method = values.paymentMethod; // Sẽ là "VNPAY" hoặc "PAYOS"

      // Gọi một thunk 'createDeposit' duy nhất
      const res = await dispatch(
        createDeposit({ amount, paymentMethod: method })
      ).unwrap();

      message.success("Tạo yêu cầu nạp tiền thành công!");

      // Backend của bạn trả về paymentUrl trong cả 2 trường hợp
      const url = res.paymentUrl;
      if (url) {
        window.open(url, "_blank"); // Mở link thanh toán
      }

      setDepositModalOpen(false);
      depositForm.resetFields();
      fetchData(); // Tải lại data
    } catch (err: any) {
      message.error(err.message || "Lỗi nạp tiền");
    }
  };
  // --- KẾT THÚC SỬA ---

  const handleWithdrawSubmit = async () => {
    try {
      const values = await withdrawForm.validateFields();
      await dispatch(
        createWithdraw({
          amount: Number(values.amount),
          bankName: values.bankName,
          bankAccountNumber: values.bankAccountNumber,
          accountHolderName: values.accountHolderName,
        })
      ).unwrap();

      message.success("Gửi yêu cầu rút tiền thành công!");
      setWithdrawModalOpen(false);
      withdrawForm.resetFields();
      fetchData(); // Tải lại data
    } catch (err: any) {
      message.error(err.message || "Lỗi rút tiền");
    }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "#d97706",
      SUCCESS: "#16a34a",
      COMPLETED: "#16a34a",
      FAILED: "#dc2626",
      REJECTED: "#dc2626",
      REFUNDED: "#7c3aed",
      // Thêm các loại giao dịch mới
      PROJECT_UPGRADE: "#0ea5e9",
      PROJECT_PAYMENT: "#ef4444",
      PAYMENT_RELEASE: "#16a34a",
    };
    return map[status] || "#64748b";
  };

  const getStatusBg = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "#fefce8",
      SUCCESS: "#dcfce7",
      COMPLETED: "#dcfce7",
      FAILED: "#fee2e2",
      REJECTED: "#fee2e2",
      REFUNDED: "#ede9fe",
      // Thêm các loại giao dịch mới
      PROJECT_UPGRADE: "#f0f9ff",
      PROJECT_PAYMENT: "#fee2e2",
      PAYMENT_RELEASE: "#dcfce7",
    };
    return map[status] || "#f1f5f9";
  };

  const getAmountColor = (type: string, amount: number | string) => {
    const numAmount = Number(amount);
    if (
      type === "DEPOSIT" ||
      type === "PAYMENT_RELEASE" ||
      type === "REFUNDED"
    ) {
      return "#16a34a"; // Màu xanh cho tiền vào
    }
    if (numAmount < 0) {
      return "#dc2626"; // Màu đỏ cho tiền ra (nếu BE trả số âm)
    }
    // Mặc định (cho WITHDRAW, PROJECT_PAYMENT, PROJECT_UPGRADE)
    return "#0f172a";
  };

  const getAmountPrefix = (type: string, amount: number | string) => {
    const numAmount = Number(amount);
    if (
      type === "DEPOSIT" ||
      type === "PAYMENT_RELEASE" ||
      type === "REFUNDED"
    ) {
      return "+";
    }
    if (numAmount < 0) {
      return ""; // Số tiền đã có dấu âm
    }
    return "-"; // Mặc định trừ
  };

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      {/* --- Header & Actions --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Transaction History
          </h2>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setDepositModalOpen(true)}
            style={{
              fontSize: 14,
              padding: "8px 16px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            + Deposit Money
          </button>
          <button
            onClick={() => setWithdrawModalOpen(true)}
            style={{
              fontSize: 14,
              padding: "8px 16px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Request Withdrawal
          </button>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 200,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            padding: 16,
          }}
        >
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 4px" }}>
            Available Balance
          </p>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 4px",
            }}
          >
            {formatCurrency(wallet?.balance ?? 0)}
          </h2>
          <p style={{ fontSize: 12, color: "#10b981", margin: 0 }}>
            Ready to use
          </p>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 200,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            padding: 16,
          }}
        >
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 4px" }}>
            Total Deposited
          </p>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#3b82f6",
              margin: "0 0 4px",
            }}
          >
            {formatCurrency(wallet?.totalDeposits ?? 0)}
          </h2>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 200,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            padding: 16,
          }}
        >
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 4px" }}>
            Total Invested
          </p>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#8b5cf6",
              margin: "0 0 4px",
            }}
          >
            {formatCurrency(wallet?.totalInvested ?? 0)}
          </h2>
        </div>
      </div>

      {/* --- Transaction List --- */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          padding: 16,
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#0f172a",
            margin: "0 0 8px",
          }}
        >
          Recent Transactions
        </h3>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px" }}>
          Your deposit and withdrawal history
        </p>

        {status === "loading" && transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spin />
          </div>
        ) : transactions.length === 0 ? (
          <Empty description="No transactions found" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {transactions.map((item) => (
              <div
                key={item.id}
                style={{ background: "#f9fafb", borderRadius: 8, padding: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {item.type.replace("_", " ").toLowerCase()}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        background: getStatusBg(item.status),
                        color: getStatusColor(item.status),
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontWeight: 500,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: getAmountColor(item.type, item.amount),
                    }}
                  >
                    {getAmountPrefix(item.type, item.amount)}
                    {formatCurrency(Math.abs(Number(item.amount)))}
                  </span>
                </div>
                <p
                  style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}
                >
                  Date: {formatDateTime(item.createdAt)} • ID: #{item.id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Deposit Modal --- */}
      <Modal
        title="Deposit Money"
        open={depositModalOpen}
        onCancel={() => setDepositModalOpen(false)}
        onOk={handleDepositSubmit}
        confirmLoading={status === "loading"} // Dùng status từ slice
        okText="Confirm Deposit"
      >
        <Form form={depositForm} layout="vertical">
          <Form.Item
            label="Amount (VND)"
            name="amount"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                type: "number",
                min: 10000,
                message: "Minimum deposit is 10,000 VND",
              },
            ]}
          >
            <InputNumber<number>
              style={{ width: "100%" }}
              min={10000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              // --- SỬA PARSER ---
              parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
            />
          </Form.Item>
          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            initialValue="PAYOS" // Đặt PayOS làm mặc định
          >
            <Select
              options={[
                // --- SỬA DANH SÁCH ---
                { label: "PayOS (Recommended)", value: "PAYOS" },
                { label: "VNPay", value: "VNPAY" },
                // { label: "MoMo", value: "MOMO" },
                // { label: "ZaloPay", value: "ZALOPAY" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* --- Withdraw Modal --- */}
      <Modal
        title="Withdraw Money"
        open={withdrawModalOpen}
        onCancel={() => setWithdrawModalOpen(false)}
        onOk={handleWithdrawSubmit}
        confirmLoading={status === "loading"} // Dùng status từ slice
        okText="Confirm Withdrawal"
      >
        <Form form={withdrawForm} layout="vertical">
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#f0f2f5",
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 12, color: "#666" }}>Available: </span>
            <strong style={{ color: "#3b82f6" }}>
              {formatCurrency(wallet?.balance)}
            </strong>
          </div>
          <Form.Item
            label="Amount (VND)"
            name="amount"
            rules={[
              { required: true },
              {
                type: "number",
                max: Number(wallet?.balance ?? 0),
                message: "Insufficient balance",
              },
              {
                type: "number",
                min: 50000, // Đặt giới hạn rút tối thiểu
                message: "Minimum withdrawal is 50,000 VND",
              },
            ]}
          >
            <InputNumber<number>
              style={{ width: "100%" }}
              min={50000}
              max={Number(wallet?.balance ?? 0)}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              // --- SỬA PARSER ---
              parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
            />
          </Form.Item>
          <Form.Item
            label="Bank Name"
            name="bankName"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select bank">
              <Select.Option value="Vietcombank">Vietcombank</Select.Option>
              <Select.Option value="Techcombank">Techcombank</Select.Option>
              <Select.Option value="MB">MB Bank</Select.Option>
              <Select.Option value="ACB">ACB</Select.Option>
              <Select.Option value="VPBank">VPBank</Select.Option>
              <Select.Option value="BIDV">BIDV</Select.Option>
              <Select.Option value="VietinBank">VietinBank</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Account Number"
            name="bankAccountNumber"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Account Holder Name"
            name="accountHolderName"
            rules={[{ required: true }]}
          >
            <Input placeholder="UPPERCASE NAME (e.g., NGUYEN VAN A)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Payment;
