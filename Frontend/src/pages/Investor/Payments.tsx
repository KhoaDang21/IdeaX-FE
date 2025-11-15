import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
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
    Spin,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";

import type { RootState, AppDispatch } from "../../store";
import {
    createDeposit,
    createPayment,
    createWithdraw,
    getMyWallet,
    getTransactionHistory,
    refundPayment,
} from "../../services/features/payment/paymentSlice";
import { getAllProjects } from "../../services/features/project/projectSlice";
import type {
    TransactionResponse,
    WalletResponse,
} from "../../interfaces/payment";

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
    PENDING: "gold",
    SUCCESS: "green",
    COMPLETED: "green",
    RELEASED: "blue",
    REFUNDED: "volcano",
    FAILED: "red",
    REJECTED: "red",
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

const extractErrorMessage = (err: any, fallback: string) => {
    if (!err) return fallback;
    if (typeof err === "string") return err;
    return (
        err.message || err.payload || err.response?.data?.message || String(err)
    );
};

const Payments: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        wallet,
        transactions,
        transactionsPage,
    } = useSelector((state: RootState) => state.payment);
    const { projects } = useSelector((state: RootState) => state.project);

    const [initializing, setInitializing] = useState(true);
    const [walletLoading, setWalletLoading] = useState(false);
    const [transactionsLoading, setTransactionsLoading] = useState(false);

    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [investModalOpen, setInvestModalOpen] = useState(false);
    const [refundModalOpen, setRefundModalOpen] = useState(false);

    const [depositForm] = Form.useForm();
    const [withdrawForm] = Form.useForm();
    const [investForm] = Form.useForm();
    const [refundForm] = Form.useForm();

    const [depositing, setDepositing] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [investing, setInvesting] = useState(false);
    const [selectedRefundPayment, setSelectedRefundPayment] = useState<number | null>(null);
    const [refunding, setRefunding] = useState(false);

    const [transactionPage, setTransactionPage] = useState(1);
    const [transactionPageSize, setTransactionPageSize] = useState(10);

    const fetchWallet = useCallback(async () => {
        setWalletLoading(true);
        try {
            await dispatch(getMyWallet()).unwrap();
        } catch (err: any) {
            message.error(extractErrorMessage(err, "Unable to load wallet information"));
        } finally {
            setWalletLoading(false);
        }
    }, [dispatch]);

    const fetchTransactions = useCallback(
        async (page: number, size: number) => {
            setTransactionsLoading(true);
            try {
                await dispatch(
                    getTransactionHistory({
                        page: Math.max(page - 1, 0),
                        size,
                    })
                ).unwrap();
            } catch (err: any) {
                message.error(extractErrorMessage(err, "Unable to load transaction history"));
            } finally {
                setTransactionsLoading(false);
            }
        },
        [dispatch]
    );

    const fetchProjects = useCallback(async () => {
        try {
            await dispatch(getAllProjects()).unwrap();
        } catch (err: any) {
            message.error(extractErrorMessage(err, "Failed to load projects"));
        }
    }, [dispatch]);

    useEffect(() => {
        const init = async () => {
            setInitializing(true);
            await Promise.all([
                fetchWallet(),
                fetchTransactions(1, transactionPageSize),
                fetchProjects(),
            ]);
            setInitializing(false);
        };
        void init();
    }, [fetchWallet, fetchTransactions, fetchProjects, transactionPageSize]);

    const investableProjects = useMemo(
        () =>
            projects
                .filter((project) => project.status === "PUBLISHED")
                .map((project) => ({
                    label: project.projectName,
                    value: project.id,
                })),
        [projects]
    );

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const newPage = pagination.current ?? 1;
        const newSize = pagination.pageSize ?? transactionPageSize;
        setTransactionPage(newPage);
        setTransactionPageSize(newSize);
        void fetchTransactions(newPage, newSize);
    };

    const handleDepositSubmit = async () => {
        try {
            const values = await depositForm.validateFields();
            setDepositing(true);
            const amount = Number(values.amount);
            const method = "PAYOS";
            const res = await dispatch(createDeposit({ amount, paymentMethod: method })).unwrap();
            message.success(`Deposit request created. Redirecting to PayOS`);
            const url = res.redirectUrl || res.paymentUrl;
            if (url) {
                window.location.href = url;
            } else {
                message.error("Không tìm thấy URL thanh toán từ cổng thanh toán.");
            }
            setDepositModalOpen(false);
            depositForm.resetFields();
            await fetchWallet();
            await fetchTransactions(1, transactionPageSize);
            setTransactionPage(1);
        } catch (err: any) {
            message.error(extractErrorMessage(err, "Failed to create deposit request"));
        } finally {
            setDepositing(false);
        }
    };

    const handleWithdrawSubmit = async () => {
        try {
            const values = await withdrawForm.validateFields();
            const balance = Number(walletData?.balance ?? 0);
            const amount = Number(values.amount ?? 0);
            const minWithdraw = 2500;
            if (amount < minWithdraw) {
                message.error(`Minimum withdraw amount is ${formatCurrency(minWithdraw)}`);
                return;
            }
            if (amount > balance) {
                message.error("Insufficient balance to perform withdrawal");
                return;
            }
            setWithdrawing(true);
            await dispatch(
                createWithdraw({
                    amount: Number(values.amount),
                    bankName: values.bankName,
                    bankAccountNumber: values.bankAccountNumber,
                    accountHolderName: values.accountHolderName,
                })
            ).unwrap();
            message.success("Withdraw request created");
            setWithdrawModalOpen(false);
            withdrawForm.resetFields();
            await fetchTransactions(1, transactionPageSize);
            await fetchWallet();
            setTransactionPage(1);
        } catch (err: any) {
            message.error(extractErrorMessage(err, "Failed to create withdraw request"));
        } finally {
            setWithdrawing(false);
        }
    };

    const handleInvestSubmit = async () => {
        try {
            const values = await investForm.validateFields();
            setInvesting(true);
            await dispatch(
                createPayment({
                    projectId: Number(values.projectId),
                    amount: Number(values.amount),
                })
            ).unwrap();
            message.success("Investment created successfully");
            setInvestModalOpen(false);
            investForm.resetFields();
            await Promise.all([
                fetchWallet(),
                fetchTransactions(1, transactionPageSize),
            ]);
            setTransactionPage(1);
        } catch (err: any) {
            message.error(extractErrorMessage(err, "Failed to create investment"));
        } finally {
            setInvesting(false);
        }
    };

    const closeRefundModal = () => {
        setRefundModalOpen(false);
        setSelectedRefundPayment(null);
        refundForm.resetFields();
    };

    const handleRefundSubmit = async () => {
        if (!selectedRefundPayment) return;
        try {
            const values = await refundForm.validateFields();
            setRefunding(true);
            await dispatch(
                refundPayment({
                    paymentId: selectedRefundPayment,
                    payload: { reason: values.reason },
                })
            ).unwrap();
            message.success("Refund request submitted");
            closeRefundModal();
            await Promise.all([
                fetchWallet(),
                fetchTransactions(transactionPage, transactionPageSize),
            ]);
        } catch (err: any) {
            message.error(extractErrorMessage(err, "Failed to submit refund request"));
        } finally {
            setRefunding(false);
        }
    };

    const walletData: WalletResponse | null = wallet ?? null;

    const totals = useMemo(() => {
        // Compute totals based on TransactionType and TransactionStatus from backend
        let totalDeposits = 0;
        let totalInvested = 0;
        let pendingWithdrawals = 0;
        if (!transactions || transactions.length === 0) return { totalDeposits, totalInvested, pendingWithdrawals };

        for (const t of transactions) {
            const amt = Number(t.amount ?? 0);
            const abs = Math.abs(amt);
            // Deposits that succeeded
            if (t.type === "DEPOSIT" && t.status === "SUCCESS") {
                totalDeposits += abs;
            }

            // Project payments represent investor investments (amount stored negative when charged)
            if (t.type === "PROJECT_PAYMENT" && t.status === "SUCCESS") {
                totalInvested += abs;
            }

            // Refunds reduce invested amount (represented by PAYMENT_REFUND transactions)
            if (t.type === "PAYMENT_REFUND" && t.status === "SUCCESS") {
                totalInvested -= abs;
            }

            // Pending withdrawals (amount stored negative)
            if (t.type === "WITHDRAW" && t.status === "PENDING") {
                pendingWithdrawals += abs;
            }
        }

        // Ensure totals non-negative
        if (totalInvested < 0) totalInvested = 0;

        return { totalDeposits, totalInvested, pendingWithdrawals };
    }, [transactions]);

    const availableForWithdrawal = useMemo(() => {
        // Backend currently returns only `balance`. Use that as the source of truth.
        // If there are pending withdrawal requests that already deducted balance on server,
        // they are already reflected in `balance`. We still expose the number as a hint.
        const bal = Number(walletData?.balance ?? 0);
        return bal;
    }, [walletData]);

    const columns: ColumnsType<TransactionResponse> = [
        {
            title: "Thời gian",
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
                    PROJECT_PAYMENT: "green",
                    PAYMENT_RELEASE: "cyan",
                    PAYMENT_REFUND: "volcano",
                    PROJECT_UPGRADE: "purple",
                };
                return <Tag color={typeColors[value] || "default"}>{value}</Tag>;
            },
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (value: string) => formatCurrency(value),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value: string) => (
                <Tag color={statusColor[value] ?? "default"}>{value}</Tag>
            ),
        },
        // Action column removed — actions handled elsewhere or by admin
    ];

    const renderWalletSummary = () => (
        <div>
            {/* Header similar to other Investor pages */}
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
                        <Title level={3} style={{
                            margin: 0,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: 700,
                        }}>
                            Payment Management
                        </Title>
                        <Text type="secondary" style={{ fontSize: 14, color: "#666" }}>
                            Manage wallet, transactions and deposits/withdrawals
                        </Text>
                    </Col>
                </Row>
            </div>

            {/* Wallet card with neutral, high-contrast background */}
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
                            style={{
                                background: "white",
                                border: "1px solid #f0f0f0",
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                            }}
                            bodyStyle={{ padding: "20px 16px" }}
                        >
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 14, color: "#666", marginBottom: 12, fontWeight: 500 }}>Current Balance</div>
                                <div style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#722ED1",
                                    background: "linear-gradient(135deg, #722ED1 0%, #1677ff 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}>{formatCurrency(walletData?.balance ?? 0)}</div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card
                            style={{
                                background: "white",
                                border: "1px solid #f0f0f0",
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                            }}
                            bodyStyle={{ padding: "20px 16px" }}
                        >
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 14, color: "#666", marginBottom: 12, fontWeight: 500 }}>Total Deposits</div>
                                <div style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#722ED1",
                                    background: "linear-gradient(135deg, #722ED1 0%, #1677ff 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}>{formatCurrency(totals.totalDeposits ?? 0)}</div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card
                            style={{
                                background: "white",
                                border: "1px solid #f0f0f0",
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                            }}
                            bodyStyle={{ padding: "20px 16px" }}
                        >
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 14, color: "#666", marginBottom: 12, fontWeight: 500 }}>Total Invested</div>
                                <div style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#722ED1",
                                    background: "linear-gradient(135deg, #722ED1 0%, #1677ff 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}>{formatCurrency(totals.totalInvested ?? 0)}</div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card
                            style={{
                                background: "white",
                                border: "1px solid #f0f0f0",
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                            }}
                            bodyStyle={{ padding: "20px 16px" }}
                        >
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 14, color: "#666", marginBottom: 12, fontWeight: 500 }}>Available to Withdraw</div>
                                <div style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#722ED1",
                                    background: "linear-gradient(135deg, #722ED1 0%, #1677ff 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}>{formatCurrency(availableForWithdrawal ?? walletData?.balance ?? 0)}</div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Space size={[12, 12]} wrap style={{ marginTop: 20 }}>
                    <Button
                        type="primary"
                        size="large"
                        style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            border: "none",
                            fontWeight: 600,
                            height: 40,
                            borderRadius: 8,
                        }}
                        onClick={() => setDepositModalOpen(true)}
                    >
                        Deposit
                    </Button>
                    <Button
                        size="large"
                        style={{
                            background: "#fafafa",
                            color: "#111",
                            border: "1px solid #e6e6e6",
                            fontWeight: 600,
                            height: 40,
                            borderRadius: 8,
                        }}
                        onClick={() => setWithdrawModalOpen(true)}
                    >
                        Withdraw
                    </Button>
                    <Button
                        size="large"
                        style={{
                            background: "#fafafa",
                            color: "#111",
                            border: "1px solid #e6e6e6",
                            fontWeight: 600,
                            height: 40,
                            borderRadius: 8,
                        }}
                        onClick={() => setInvestModalOpen(true)}
                        disabled={!investableProjects.length}
                    >
                        Invest
                    </Button>
                    <Button
                        size="large"
                        style={{
                            background: "#fafafa",
                            color: "#111",
                            border: "1px solid #e6e6e6",
                            fontWeight: 600,
                            height: 40,
                            borderRadius: 8,
                        }}
                        onClick={() => fetchWallet()}
                        loading={walletLoading}
                    >
                        Refresh Balance
                    </Button>
                </Space>
            </Card>
        </div>
    );

    const renderTransactionsSection = () => (
        <Card
            style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "none"
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
                <Button
                    onClick={() => fetchTransactions(transactionPage, transactionPageSize)}
                    loading={transactionsLoading}
                >
                    Refresh
                </Button>
            </div>
            <Table<TransactionResponse>
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={transactions}
                loading={transactionsLoading}
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
        </Card>
    );

    // Compute pending requests from transactions
    const pendingRequests = useMemo(() => {
        const pendingDeposits = transactions.filter(
            t => t.type === 'DEPOSIT' && t.status === 'PENDING'
        );
        const pendingWithdrawals = transactions.filter(
            t => t.type === 'WITHDRAW' && t.status === 'PENDING'
        );
        const pendingRefunds = transactions.filter(
            t => t.type === 'PAYMENT_REFUND' && t.status === 'PENDING'
        );

        return {
            deposits: pendingDeposits,
            withdrawals: pendingWithdrawals,
            refunds: pendingRefunds
        };
    }, [transactions]);

    const renderPendingRequests = () => (
        <Card
            style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "none"
            }}
        >
            <Title level={4} style={{ marginBottom: 24 }}>
                Pending Requests
            </Title>

            {/* Deposit Requests */}
            {pendingRequests.deposits.map((deposit) => (
                <div
                    key={deposit.id}
                    style={{
                        padding: 16,
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        marginBottom: 16
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <Text strong>Deposit Request</Text>
                            <div style={{ color: "#666", fontSize: 12 }}>Pending</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                                {formatCurrency(deposit.amount)}
                            </Text>
                            <div style={{ color: "#666", fontSize: 12 }}>Bank transfer</div>
                        </div>
                    </div>
                    <div style={{ color: "#666", fontSize: 12, marginTop: 8 }}>
                        Requested: {formatDateTime(deposit.createdAt)}
                    </div>
                </div>
            ))}

            {/* Refund Requests */}
            {pendingRequests.refunds.map((refund) => (
                <div
                    key={refund.id}
                    style={{
                        padding: 16,
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        marginBottom: 16
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                            <Text strong>Refund Request</Text>
                            <Tag color="processing" style={{ marginLeft: 8 }}>Processing</Tag>
                            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
                                Related transaction ID: {refund.paymentId ?? "-"}
                            </div>
                            <div style={{ color: "#666", fontSize: 12 }}>
                                Reason: Investment refund
                            </div>
                            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
                                Estimated completion: {dayjs(refund.createdAt).add(3, 'day').format("DD/MM/YYYY")}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <Text strong style={{ fontSize: 16, color: "#ff4d4f" }}>
                                {formatCurrency(refund.amount)}
                            </Text>
                            <div style={{ color: "#666", fontSize: 12 }}>Requested: {formatDateTime(refund.createdAt)}</div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Withdrawal Requests */}
            {pendingRequests.withdrawals.map((withdrawal) => (
                <div
                    key={withdrawal.id}
                    style={{
                        padding: 16,
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        marginBottom: 16
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <Text strong>Withdraw Request</Text>
                            <Tag color="gold" style={{ marginLeft: 8 }}>Pending</Tag>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                                {formatCurrency(withdrawal.amount)}
                            </Text>
                            <div style={{ color: "#666", fontSize: 12 }}>Requested: {formatDateTime(withdrawal.createdAt)}</div>
                        </div>
                    </div>
                    <Button type="text" danger size="small" style={{ marginTop: 8, padding: 0 }}>
                        Cancel request
                    </Button>
                </div>
            ))}

            {!pendingRequests.deposits.length && !pendingRequests.withdrawals.length && !pendingRequests.refunds.length && (
                <Empty
                    description="No pending requests"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}
        </Card>
    );

    if (initializing) {
        return (
            <div
                style={{
                    minHeight: "60vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                }}
            >
                <Spin size="large" />
                <Text type="secondary">Loading payment information...</Text>
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

            {/* Modals (UI translated to English) */}
            <Modal
                title="Deposit to Wallet"
                open={depositModalOpen}
                onCancel={() => {
                    setDepositModalOpen(false);
                    depositForm.resetFields();
                }}
                onOk={handleDepositSubmit}
                confirmLoading={depositing}
                okText="Create Request"
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
                                min: 2500,
                                message: "Minimum 2,500 VND",
                            },
                        ]}
                    >
                        <InputNumber<number>
                            style={{ width: "100%" }}
                            min={2500}
                            step={2500}
                            formatter={formatNumberInput}
                            parser={parseNumberInput}
                        />
                    </Form.Item>
                </Form>
                <Text type="secondary">You will be redirected to PayOS.</Text>
            </Modal>

            <Modal
                title="Create Withdraw Request"
                open={withdrawModalOpen}
                onCancel={() => {
                    setWithdrawModalOpen(false);
                    withdrawForm.resetFields();
                }}
                onOk={handleWithdrawSubmit}
                confirmLoading={withdrawing}
                okText="Submit Request"
                cancelText="Cancel"
            >
                <Form form={withdrawForm} layout="vertical">
                    <Form.Item
                        label="Amount (VND)"
                        name="amount"
                        rules={[
                            { required: true, message: "Please enter amount" },
                            {
                                type: "number",
                                min: 2500,
                                message: "Minimum 2,500 VND",
                            },
                            () => ({
                                validator(_, value) {
                                    const bal = Number(walletData?.balance ?? 0);
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
                            min={2500}
                            step={2500}
                            formatter={formatNumberInput}
                            parser={parseNumberInput}
                        />
                    </Form.Item>
                    <Text type="secondary">Available balance: {formatCurrency(walletData?.balance ?? 0)}</Text>
                    <Form.Item
                        label="Bank name"
                        name="bankName"
                        rules={[{ required: true, message: "Please select bank" }]}
                    >
                        <Select placeholder="Select bank">
                            <Select.Option value="Vietcombank">Vietcombank</Select.Option>
                            <Select.Option value="BIDV">BIDV</Select.Option>
                            <Select.Option value="Techcombank">Techcombank</Select.Option>
                            <Select.Option value="VietinBank">VietinBank</Select.Option>
                            <Select.Option value="ACB">ACB</Select.Option>
                            <Select.Option value="MB">MB Bank</Select.Option>
                            <Select.Option value="Sacombank">Sacombank</Select.Option>
                            <Select.Option value="VPBank">VPBank</Select.Option>
                            <Select.Option value="TPBank">TPBank</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Account number"
                        name="bankAccountNumber"
                        rules={[{ required: true, message: "Please enter account number" }]}
                    >
                        <Input placeholder="Enter account number" />
                    </Form.Item>
                    <Form.Item
                        label="Account holder name"
                        name="accountHolderName"
                        rules={[{ required: true, message: "Please enter account holder name" }]}
                    >
                        <Input placeholder="Full name" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Invest in Project"
                open={investModalOpen}
                onCancel={() => {
                    setInvestModalOpen(false);
                    investForm.resetFields();
                }}
                onOk={handleInvestSubmit}
                confirmLoading={investing}
                okText="Invest"
                cancelText="Cancel"
            >
                <Form form={investForm} layout="vertical">
                    <Form.Item
                        label="Project"
                        name="projectId"
                        rules={[{ required: true, message: "Please select project" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a project to invest"
                            options={investableProjects}
                            filterOption={(input, option) =>
                                (option?.label as string)
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label="Amount (VND)"
                        name="amount"
                        rules={[
                            { required: true, message: "Please enter amount" },
                            {
                                type: "number",
                                min: 2500,
                                message: "Minimum 2,500 VND",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const projectId = getFieldValue('projectId');
                                    const amount = Number(value ?? 0);
                                    const balance = Number(walletData?.balance ?? 0);

                                    if (!projectId) {
                                        return Promise.resolve();
                                    }

                                    const project = projects.find(p => p.id === Number(projectId));
                                    if (!project) return Promise.resolve();

                                    // project.fundingAmount may be undefined; handle defensively
                                    const fundingAmount = Number(project.fundingAmount ?? 0);
                                    const fundingReceived = Number((project as any).fundingReceived ?? 0);
                                    const remaining = Math.max(fundingAmount - fundingReceived, 0);

                                    // check against wallet balance
                                    if (amount > balance) {
                                        return Promise.reject(new Error('Insufficient balance'));
                                    }

                                    // check against remaining funding
                                    if (fundingAmount <= 0) {
                                        return Promise.reject(new Error('Project has no funding target'));
                                    }
                                    if (amount > remaining) {
                                        return Promise.reject(new Error(`Cannot invest more than remaining funding (${formatCurrency(remaining)})`));
                                    }

                                    // check project minimum if provided
                                    const projectMin = Number((project as any).minimumInvestment ?? 0);
                                    if (projectMin > 0 && amount < projectMin) {
                                        return Promise.reject(new Error(`Project minimum investment is ${formatCurrency(projectMin)}`));
                                    }

                                    return Promise.resolve();
                                }
                            }),
                        ]}
                    >
                        <InputNumber<number>
                            style={{ width: "100%" }}
                            min={2500}
                            step={2500}
                            formatter={formatNumberInput}
                            parser={parseNumberInput}
                        />
                    </Form.Item>
                    <Form.Item shouldUpdate={(prev, curr) => prev !== curr}>
                        {() => {
                            const projectId = investForm.getFieldValue('projectId');
                            if (!projectId) return null;
                            const project = projects.find(p => p.id === Number(projectId));
                            if (!project) return <Text type="secondary">Project does not exist</Text>;
                            const fundingAmount = Number(project.fundingAmount ?? 0);
                            const fundingReceived = Number((project as any).fundingReceived ?? 0);
                            const remaining = Math.max(fundingAmount - fundingReceived, 0);
                            const projectMin = Number((project as any).minimumInvestment ?? 0);
                            return (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Available balance: {formatCurrency(walletData?.balance ?? 0)}</Text>
                                    <br />
                                    <Text type="secondary">Funding target: {formatCurrency(fundingAmount)}</Text>
                                    <br />
                                    <Text type="secondary">Received: {formatCurrency(fundingReceived)}</Text>
                                    <br />
                                    <Text type="secondary">Remaining: {formatCurrency(remaining)}</Text>
                                    {projectMin > 0 && (
                                        <>
                                            <br />
                                            <Text type="secondary">Project minimum investment: {formatCurrency(projectMin)}</Text>
                                        </>
                                    )}
                                </div>
                            );
                        }}
                    </Form.Item>
                </Form>
                {!investableProjects.length && (
                    <Text type="secondary">
                        No PUBLISHED projects to invest.
                    </Text>
                )}
            </Modal>

            <Modal
                title="Refund Request"
                open={refundModalOpen}
                onCancel={closeRefundModal}
                onOk={handleRefundSubmit}
                confirmLoading={refunding}
                okText="Submit Request"
                cancelText="Cancel"
                destroyOnClose
            >
                <Form form={refundForm} layout="vertical">
                    <Form.Item
                        label="Refund reason"
                        name="reason"
                        rules={[{ required: true, message: "Please enter reason" }]}
                    >
                        <Input.TextArea rows={4} placeholder="Describe the reason for refund" />
                    </Form.Item>
                </Form>
                <Text type="secondary">
                    Only applicable to investments in PENDING state.
                </Text>
            </Modal>
        </div>
    );
};

export default Payments;