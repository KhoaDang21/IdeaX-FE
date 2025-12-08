import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import InlineLoading from "../../components/InlineLoading";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";

import type { RootState, AppDispatch } from "../../store";
import {
  createDeposit,
  createWithdraw,
  getMyWallet,
  getTransactionHistory,
} from "../../services/features/payment/paymentSlice";

import type { TransactionResponse } from "../../interfaces/payment";

const { Title, Text } = Typography;

// --- Helper Functions & Constants ---
const statusColor: Record<string, string> = {
  PENDING: "gold",
  SUCCESS: "green",
  COMPLETED: "green",
  RELEASED: "blue",
  REFUNDED: "volcano",
  FAILED: "red",
  REJECTED: "red",
  CANCELLED: "red",
};

const formatNumberInput = (value?: string | number) => {
  if (value === undefined || value === null) return "";
  const stringified = typeof value === "number" ? value.toString() : value;
  return stringified.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumberInput = (value?: string) => {
  if (!value) return 0;
  const numeric = Number(value.replace(/,/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const formatCurrency = (value?: string | number) => {
  if (value === undefined || value === null) return "-";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return "-";
  return new Intl.NumberFormat("en-US", {
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
  const { wallet, transactions, transactionsPage, status } = useSelector(
    (state: RootState) => state.payment
  );

  const [initializing, setInitializing] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  // Pagination states
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPageSize, setTransactionPageSize] = useState(10);

  // --- Fetch Data ---
  const fetchData = useCallback(
    async (page: number, size: number) => {
      try {
        await Promise.all([
          dispatch(getMyWallet()).unwrap(),
          dispatch(
            getTransactionHistory({ page: Math.max(page - 1, 0), size })
          ).unwrap(),
        ]);
      } catch (error: any) {
        console.error("Failed to fetch payment data:", error);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const init = async () => {
      setInitializing(true);
      await fetchData(1, transactionPageSize);
      setInitializing(false);
    };
    init();
  }, [fetchData, transactionPageSize]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const newPage = pagination.current ?? 1;
    const newSize = pagination.pageSize ?? transactionPageSize;
    setTransactionPage(newPage);
    setTransactionPageSize(newSize);
    void fetchData(newPage, newSize);
  };

  // --- Actions ---
  const handleDepositSubmit = async () => {
    try {
      const values = await depositForm.validateFields();
      const amount = Number(values.amount);
      const res = await dispatch(
        createDeposit({ amount, paymentMethod: "PAYOS" })
      ).unwrap();

      message.success("Deposit request created. Redirecting...");
      const url = res.redirectUrl || res.paymentUrl;
      if (url) {
        window.location.href = url;
      }
      setDepositModalOpen(false);
      depositForm.resetFields();
    } catch (err: any) {
      message.error(err.message || "Failed to create deposit request");
    }
  };

  const handleWithdrawSubmit = async () => {
    try {
      const values = await withdrawForm.validateFields();
      const balance = Number(wallet?.balance ?? 0);
      const amount = Number(values.amount ?? 0);

      if (amount > balance) {
        message.error("Insufficient balance");
        return;
      }

      await dispatch(
        createWithdraw({
          amount,
          bankName: values.bankName,
          bankAccountNumber: values.bankAccountNumber,
          accountHolderName: values.accountHolderName,
        })
      ).unwrap();

      message.success("Withdraw request created");
      setWithdrawModalOpen(false);
      withdrawForm.resetFields();
      fetchData(1, transactionPageSize);
    } catch (err: any) {
      message.error(err.message || "Failed to create withdraw request");
    }
  };

  // --- Calculations ---
  const totals = useMemo(() => {
    let totalDeposits = 0;
    let totalReceived = 0;
    let pendingWithdrawals = 0;

    if (!transactions || transactions.length === 0)
      return { totalDeposits, totalReceived, pendingWithdrawals };

    for (const t of transactions) {
      const amt = Number(t.amount ?? 0);
      const abs = Math.abs(amt);

      if (t.type === "DEPOSIT" && t.status === "SUCCESS") {
        totalDeposits += abs;
      }
      if (t.type === "PAYMENT_RELEASE" && t.status === "SUCCESS") {
        totalReceived += abs;
      }
      if (t.type === "WITHDRAW" && t.status === "PENDING") {
        pendingWithdrawals += abs;
      }
    }
    return { totalDeposits, totalReceived, pendingWithdrawals };
  }, [transactions]);

  const availableForWithdrawal = useMemo(() => {
    return Number(wallet?.balance ?? 0);
  }, [wallet]);

  // --- Render Sections ---
  const columns: ColumnsType<TransactionResponse> = [
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (value: string) => {
        const typeColors: Record<string, string> = {
          DEPOSIT: "blue",
          WITHDRAW: "orange",
          PROJECT_PAYMENT: "purple",
          PAYMENT_RELEASE: "green",
          PAYMENT_REFUND: "volcano",
          PROJECT_UPGRADE: "cyan",
        };
        let label = value;
        if (value === "PAYMENT_RELEASE") label = "RECEIVED FUND";
        if (value === "PROJECT_UPGRADE") label = "PACKAGE UPGRADE";

        return <Tag color={typeColors[value] || "default"}>{label}</Tag>;
      },
    },
    // --- CỘT AMOUNT ĐÃ SỬA LOGIC USER ---
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value: number | string, record) => {
        let num = Number(value);

        // USER LOGIC:
        // Các loại giao dịch này là CHI PHÍ (Trừ tiền) => ÂM
        if (
          record.type === "PROJECT_UPGRADE" ||
          record.type === "NDA_FEE" ||
          record.type === "WITHDRAW" ||
          record.type === "PROJECT_PAYMENT" // Investor chuyển tiền đi
        ) {
          num = -Math.abs(num);
        }
        // Các loại giao dịch này là THU NHẬP (Cộng tiền) => DƯƠNG
        else if (
          record.type === "DEPOSIT" ||
          record.type === "PAYMENT_RELEASE" || // Startup nhận tiền
          record.type === "PAYMENT_REFUND"
        ) {
          num = Math.abs(num);
        }

        const color = num >= 0 ? "#3f8600" : "#cf1322";
        const prefix = num > 0 ? "+" : "";

        return (
          <span style={{ color, fontWeight: 600 }}>
            {prefix}
            {formatCurrency(num)}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Tag color={statusColor[value] ?? "default"}>{value}</Tag>
      ),
    },
  ];

  const renderWalletSummary = () => (
    <div>
      <div
        style={{
          background: "white",
          padding: "20px 24px",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: 16,
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title
              level={3}
              style={{
                margin: 0,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
              }}
            >
              Startup Finance
            </Title>
            <Text type="secondary" style={{ fontSize: 14, color: "#666" }}>
              Manage your funds, upgrades and withdrawals
            </Text>
          </Col>
        </Row>
      </div>

      <Card
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: 24,
          border: "1px solid #f0f0f0",
        }}
      >
        <Title level={5} style={{ marginBottom: 12, color: "#1a1a1a" }}>
          Wallet Overview
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{ background: "#f9fafb", borderRadius: 12 }}
              bodyStyle={{ padding: "16px" }}
            >
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Current Balance</Text>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#059669",
                    marginTop: 8,
                  }}
                >
                  {formatCurrency(wallet?.balance ?? 0)}
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{ background: "#f9fafb", borderRadius: 12 }}
              bodyStyle={{ padding: "16px" }}
            >
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Total Deposited</Text>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2563eb",
                    marginTop: 8,
                  }}
                >
                  {formatCurrency(totals.totalDeposits)}
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{ background: "#f9fafb", borderRadius: 12 }}
              bodyStyle={{ padding: "16px" }}
            >
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Total Received Funding</Text>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#d97706",
                    marginTop: 8,
                  }}
                >
                  {formatCurrency(totals.totalReceived)}
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{ background: "#f9fafb", borderRadius: 12 }}
              bodyStyle={{ padding: "16px" }}
            >
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Available to Withdraw</Text>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#059669",
                    marginTop: 8,
                  }}
                >
                  {formatCurrency(availableForWithdrawal)}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Space size={[12, 12]} wrap style={{ marginTop: 24 }}>
          <Button
            type="primary"
            size="large"
            icon={<ArrowUpOutlined />}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              borderRadius: 8,
              height: 40,
              fontWeight: 600,
            }}
            onClick={() => setDepositModalOpen(true)}
          >
            Deposit Funds
          </Button>
          <Button
            size="large"
            icon={<ArrowDownOutlined />}
            style={{
              borderRadius: 8,
              height: 40,
              fontWeight: 600,
            }}
            onClick={() => setWithdrawModalOpen(true)}
          >
            Withdraw Funds
          </Button>
          <Button
            size="large"
            onClick={() => fetchData(1, transactionPageSize)}
            loading={status === "loading"}
          >
            Refresh
          </Button>
        </Space>
      </Card>
    </div>
  );

  const renderTransactionsSection = () => (
    <Card
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "none",
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Transaction History
        </Title>
      </div>
      {status === "loading" && (!transactions || transactions.length === 0) ? (
        <InlineLoading />
      ) : (
        <Table<TransactionResponse>
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={transactions}
          locale={{
            emptyText: (
              <Empty
                description="No transactions yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          pagination={{
            current: transactionPage,
            pageSize: transactionPageSize,
            total: transactionsPage?.totalElements ?? transactions.length,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
        />
      )}
    </Card>
  );

  const renderPendingRequests = () => {
    // Filter pending items
    const pendingDeposits = transactions.filter(
      (t) => t.type === "DEPOSIT" && t.status === "PENDING"
    );
    const pendingWithdrawals = transactions.filter(
      (t) => t.type === "WITHDRAW" && t.status === "PENDING"
    );

    return (
      <Card
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
          borderRadius: 12,
        }}
      >
        <Title level={4} style={{ marginBottom: 24 }}>
          Pending Requests
        </Title>

        {pendingDeposits.map((item) => (
          <div
            key={item.id}
            style={{
              padding: 16,
              background: "#f9fafb",
              borderRadius: 8,
              marginBottom: 12,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text strong>Deposit</Text>
                <div>
                  <Tag color="gold" style={{ margin: 0, fontSize: 10 }}>
                    PENDING
                  </Tag>
                </div>
              </div>
              <Text strong style={{ color: "#2563eb" }}>
                +{formatCurrency(Number(item.amount))}
              </Text>
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {formatDateTime(item.createdAt)}
            </div>
          </div>
        ))}

        {pendingWithdrawals.map((item) => (
          <div
            key={item.id}
            style={{
              padding: 16,
              background: "#f9fafb",
              borderRadius: 8,
              marginBottom: 12,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text strong>Withdraw</Text>
                <div>
                  <Tag color="orange" style={{ margin: 0, fontSize: 10 }}>
                    PENDING
                  </Tag>
                </div>
              </div>
              <Text strong style={{ color: "#dc2626" }}>
                {formatCurrency(Number(item.amount))}
              </Text>
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {formatDateTime(item.createdAt)}
            </div>
          </div>
        ))}

        {!pendingDeposits.length && !pendingWithdrawals.length && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No pending requests"
          />
        )}
      </Card>
    );
  };

  if (initializing) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <InlineLoading message="Loading financial data..." />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        background: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>{renderWalletSummary()}</Col>
        <Col xs={24} lg={16}>
          {renderTransactionsSection()}
        </Col>
        <Col xs={24} lg={8}>
          {renderPendingRequests()}
        </Col>
      </Row>

      {/* --- MODALS --- */}
      <Modal
        title="Deposit Money"
        open={depositModalOpen}
        onCancel={() => {
          setDepositModalOpen(false);
          depositForm.resetFields();
        }}
        onOk={handleDepositSubmit}
        confirmLoading={status === "loading"}
        okText="Pay with PayOS"
        cancelText="Cancel"
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
              step={10000}
              formatter={formatNumberInput}
              parser={parseNumberInput}
            />
          </Form.Item>
          <Text type="secondary">
            You will be redirected to PayOS payment gateway.
          </Text>
        </Form>
      </Modal>

      <Modal
        title="Withdraw Money"
        open={withdrawModalOpen}
        onCancel={() => {
          setWithdrawModalOpen(false);
          withdrawForm.resetFields();
        }}
        onOk={handleWithdrawSubmit}
        confirmLoading={status === "loading"}
        okText="Submit Request"
        cancelText="Cancel"
      >
        <Form form={withdrawForm} layout="vertical">
          <div
            style={{
              padding: 12,
              background: "#f0f9ff",
              borderRadius: 6,
              marginBottom: 16,
              border: "1px solid #bae6fd",
            }}
          >
            <Text type="secondary">Available Balance: </Text>
            <Text strong style={{ color: "#0284c7" }}>
              {formatCurrency(wallet?.balance ?? 0)}
            </Text>
          </div>

          <Form.Item
            label="Amount (VND)"
            name="amount"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                type: "number",
                min: 50000,
                message: "Minimum withdrawal is 50,000 VND",
              },
              () => ({
                validator(_, value) {
                  const bal = Number(wallet?.balance ?? 0);
                  const v = Number(value ?? 0);
                  if (!value) return Promise.resolve();
                  if (v > bal) {
                    return Promise.reject(new Error("Insufficient balance"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber<number>
              style={{ width: "100%" }}
              min={50000}
              step={50000}
              formatter={formatNumberInput}
              parser={parseNumberInput}
            />
          </Form.Item>

          <Form.Item
            label="Bank Name"
            name="bankName"
            rules={[{ required: true, message: "Please select bank" }]}
          >
            <Select placeholder="Select bank">
              <Select.Option value="Vietcombank">Vietcombank</Select.Option>
              <Select.Option value="Techcombank">Techcombank</Select.Option>
              <Select.Option value="MB">MB Bank</Select.Option>
              <Select.Option value="ACB">ACB</Select.Option>
              <Select.Option value="VPBank">VPBank</Select.Option>
              <Select.Option value="BIDV">BIDV</Select.Option>
              <Select.Option value="VietinBank">VietinBank</Select.Option>
              <Select.Option value="TPBank">TPBank</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Account Number"
            name="bankAccountNumber"
            rules={[
              { required: true, message: "Please enter account number" },
              { pattern: /^[0-9]+$/, message: "Invalid account number" },
            ]}
          >
            <Input placeholder="e.g. 1903..." />
          </Form.Item>

          <Form.Item
            label="Account Holder Name"
            name="accountHolderName"
            rules={[
              { required: true, message: "Please enter account holder name" },
            ]}
          >
            <Input placeholder="UPPERCASE NAME (e.g., NGUYEN VAN A)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Payment;
