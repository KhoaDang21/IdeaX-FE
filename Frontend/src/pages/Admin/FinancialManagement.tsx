import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
  Select,
  Button,
  Input,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  WalletOutlined,
  BankOutlined,
  RiseOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { api } from "../../services/constant/axiosInstance";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

// --- Interfaces ---
interface FinancialStats {
  totalRevenue: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalInvested: number;
  currentSystemBalance: number;
}

interface Transaction {
  id: number;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  // User Info fields
  accountId: number;
  accountEmail: string;
  accountName: string;
  accountRole: string;
}

const FinancialManagement: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchStats();
    fetchTransactions(1);
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [filterType]);

  const fetchStats = async () => {
    try {
      const res = await api.get<FinancialStats>("/api/admin/financial/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch financial stats", error);
    }
  };

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const params: any = {
        page: page - 1,
        size: pagination.pageSize,
        sort: "createdAt,desc",
      };
      if (filterType) params.type = filterType;
      if (searchText) params.search = searchText.trim();

      const res = await api.get("/api/admin/financial/transactions", {
        params,
      });
      setTransactions(res.data.content);
      setPagination({
        ...pagination,
        current: page,
        total: res.data.totalElements,
      });
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (value: string) => {
    setSearchText(value);
    setLoading(true);
    const params: any = {
      page: 0,
      size: pagination.pageSize,
      sort: "createdAt,desc",
    };
    if (filterType) params.type = filterType;
    if (value) params.search = value.trim();

    api
      .get("/api/admin/financial/transactions", { params })
      .then((res) => {
        setTransactions(res.data.content);
        setPagination({
          ...pagination,
          current: 1,
          total: res.data.totalElements,
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const columns: ColumnsType<Transaction> = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_text, _record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "User Info",
      key: "user",
      width: 280,
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: "bold", color: "#1890ff", fontSize: 14 }}>
            {record.accountEmail}
          </span>
          <span style={{ fontSize: 12, color: "#888" }}>
            {record.accountName && record.accountName !== "N/A"
              ? record.accountName
              : "No Name"}{" "}
            <span style={{ marginLeft: 4, opacity: 0.7 }}>
              (ID: {record.accountId})
            </span>
          </span>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "accountRole",
      key: "accountRole",
      width: 160,
      render: (role) => {
        let color = "default";
        if (role === "INVESTOR") color = "geekblue";
        if (role === "START_UP") color = "green";
        if (role === "ADMIN") color = "red";

        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {role ? role.replace("_", " ") : "USER"}
          </Tag>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "default";
        let icon = null;

        switch (type) {
          case "DEPOSIT":
            color = "success";
            icon = <ArrowUpOutlined />;
            break;
          case "WITHDRAW":
            color = "error";
            icon = <ArrowDownOutlined />;
            break;
          case "PROJECT_UPGRADE":
            color = "blue";
            icon = <RiseOutlined />;
            break;
          case "NDA_FEE":
            color = "geekblue";
            icon = <FileTextOutlined />;
            break;
          case "PROJECT_PAYMENT":
            color = "purple";
            icon = <DollarOutlined />;
            break;
          case "PAYMENT_RELEASE":
            color = "cyan";
            icon = <CheckCircleOutlined />;
            break;
          case "PAYMENT_REFUND":
            color = "orange";
            icon = <ArrowUpOutlined />;
            break;
          default:
            color = "default";
        }

        return (
          <Tag color={color} icon={icon}>
            {" "}
            {type.replace("_", " ")}
          </Tag>
        );
      },
    },
    // --- CỘT AMOUNT ĐÃ SỬA LOGIC ADMIN ---
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val, record) => {
        let num = Number(val);

        // ADMIN LOGIC:
        // Các loại này là tiền VÀO hệ thống (Doanh thu hoặc User nạp) => DƯƠNG
        if (
          record.type === "PROJECT_UPGRADE" ||
          record.type === "NDA_FEE" ||
          record.type === "DEPOSIT" ||
          record.type === "PAYMENT_RELEASE" || // Startup nhận tiền (Dương trong hệ thống)
          record.type === "PROJECT_PAYMENT" // Investor chuyển tiền (Dương trong hệ thống)
        ) {
          num = Math.abs(num);
        }
        // Các loại này là tiền RA khỏi hệ thống => ÂM
        else if (record.type === "WITHDRAW") {
          num = -Math.abs(num);
        }

        const isNegative = num < 0;
        return (
          <span
            style={{
              color: isNegative ? "#cf1322" : "#3f8600",
              fontWeight: "bold",
              fontFamily: "monospace",
              fontSize: 15,
            }}
          >
            {num > 0 ? "+" : ""}
            {formatCurrency(num)}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "SUCCESS"
              ? "green"
              : status === "PENDING"
              ? "gold"
              : "red"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Financial Overview
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <Statistic
              title="Total Revenue (Platform Fees)"
              value={stats?.totalRevenue}
              precision={0}
              valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
              prefix={<DollarOutlined />}
              formatter={(val) => formatCurrency(Number(val))}
            />
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              Includes Upgrade Packs & NDA Fees
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <Statistic
              title="Total User Deposits"
              value={stats?.totalDeposited}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<BankOutlined />}
              formatter={(val) => formatCurrency(Number(val))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <Statistic
              title="Total User Withdrawals"
              value={stats?.totalWithdrawn}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              prefix={<ArrowDownOutlined />}
              formatter={(val) => formatCurrency(Number(val))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <Statistic
              title="Total Invested Volume"
              value={stats?.totalInvested}
              precision={0}
              valueStyle={{ color: "#722ed1" }}
              prefix={<RiseOutlined />}
              formatter={(val) => formatCurrency(Number(val))}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card
            style={{
              background: "linear-gradient(to right, #4c51bf, #6b46c1)",
              color: "white",
            }}
            bodyStyle={{ padding: "16px 24px" }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <div style={{ opacity: 0.9, fontSize: 14 }}>
                  Current System Wallet Balance (User Funds)
                </div>
                <div style={{ fontSize: 28, fontWeight: "bold", marginTop: 4 }}>
                  <WalletOutlined style={{ marginRight: 10 }} />
                  {formatCurrency(Number(stats?.currentSystemBalance || 0))}
                </div>
              </Col>
              <Col>
                <div
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  Real-time
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card
        title="System Transactions Log"
        bordered={false}
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Search
            placeholder="Search by Email, Investor or Startup Name"
            allowClear
            onSearch={onSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 350 }}
            enterButton
          />
          <Select
            placeholder="Filter by Transaction Type"
            style={{ width: 250 }}
            allowClear
            onChange={(val) => setFilterType(val)}
          >
            <Option value="DEPOSIT">Deposit (Nạp tiền)</Option>
            <Option value="WITHDRAW">Withdraw (Rút tiền)</Option>
            <Option value="PROJECT_UPGRADE">Project Upgrade (Mua gói)</Option>
            <Option value="NDA_FEE">NDA Fee (Phí bảo mật)</Option>
            <Option value="PROJECT_PAYMENT">Investment (Đầu tư)</Option>
            <Option value="PAYMENT_RELEASE">Release (Giải ngân)</Option>
          </Select>
          <Button type="primary" onClick={() => fetchTransactions(1)}>
            Refresh Data
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page) => fetchTransactions(page),
          }}
        />
      </Card>
    </div>
  );
};

export default FinancialManagement;
