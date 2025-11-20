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
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  WalletOutlined,
  BankOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { api } from "../../services/constant/axiosInstance";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

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
}

const FinancialManagement: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const columns: ColumnsType<Transaction> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "default";
        let icon = null;
        if (type === "DEPOSIT") {
          color = "success";
          icon = <ArrowUpOutlined />;
        }
        if (type === "WITHDRAW") {
          color = "warning";
          icon = <ArrowDownOutlined />;
        }
        if (type === "PROJECT_UPGRADE") {
          color = "processing";
          icon = <RiseOutlined />;
        }
        if (type === "PROJECT_PAYMENT") {
          color = "purple";
          icon = <DollarOutlined />;
        }

        return (
          <Tag color={color} icon={icon}>
            {" "}
            {type.replace("_", " ")}
          </Tag>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => {
        const isNegative = val < 0;
        return (
          <span
            style={{
              color: isNegative ? "#cf1322" : "#3f8600",
              fontWeight: "bold",
              fontFamily: "monospace",
              fontSize: 15,
            }}
          >
            {val > 0 ? "+" : ""}
            {formatCurrency(val)}
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

      {/* --- STATS CARDS --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Doanh Thu */}
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
          </Card>
        </Col>

        {/* Tiền Nạp */}
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

        {/* Tiền Rút */}
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

        {/* Tiền Đầu Tư */}
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

        {/* Tổng số dư ví hệ thống (Hiển thị riêng cho nổi bật) */}
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

      {/* --- TRANSACTIONS TABLE --- */}
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
            flexWrap: "wrap",
          }}
        >
          <Select
            placeholder="Filter by Transaction Type"
            style={{ width: 250 }}
            allowClear
            onChange={(val) => setFilterType(val)}
          >
            <Option value="DEPOSIT">Deposit (Nạp tiền)</Option>
            <Option value="WITHDRAW">Withdraw (Rút tiền)</Option>
            <Option value="PROJECT_UPGRADE">Project Upgrade (Mua gói)</Option>
            <Option value="PROJECT_PAYMENT">Investment (Đầu tư)</Option>
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
