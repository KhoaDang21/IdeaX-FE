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
    createDeposit,
    createDepositZaloPay,
    createDepositMoMo,
    createWithdraw,
    getMyWallet,
    getTransactionHistory,
} from "../../services/features/payment/paymentSlice";

// --- Helper Functions ---
const formatCurrency = (value?: string | number) => {
    if (value === undefined || value === null) return "-";
    const numeric = typeof value === "string" ? Number(value) : value;
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

    const { wallet, transactions } = useSelector(
        (state: RootState) => state.payment
    );

    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [depositForm] = Form.useForm();
    const [withdrawForm] = Form.useForm();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([
                dispatch(getMyWallet()).unwrap(),
                dispatch(getTransactionHistory({ page: 0, size: 20 })).unwrap(),
            ]);
        } catch (error) {
            // Error handling
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDepositSubmit = async () => {
        try {
            const values = await depositForm.validateFields();
            const amount = Number(values.amount);
            const method = values.paymentMethod;

            let res;
            if (method === "MOMO") {
                res = await dispatch(
                    createDepositMoMo({ amount, paymentMethod: method })
                ).unwrap();
            } else if (method === "ZALOPAY") {
                res = await dispatch(
                    createDepositZaloPay({ amount, paymentMethod: method })
                ).unwrap();
            } else {
                res = await dispatch(
                    createDeposit({ amount, paymentMethod: "VNPAY" })
                ).unwrap();
            }

            message.success("Tạo yêu cầu nạp tiền thành công!");
            const url = res.redirectUrl || res.paymentUrl;
            if (url) window.open(url, "_blank");

            setDepositModalOpen(false);
            depositForm.resetFields();
            fetchData();
        } catch (err: any) {
            message.error(err.message || "Lỗi nạp tiền");
        }
    };

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
            fetchData();
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
        };
        return map[status] || "#f1f5f9";
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

                {loading && transactions.length === 0 ? (
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
                                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                                            {item.type}
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
                                            color:
                                                item.type === "DEPOSIT" || item.type === "REFUND"
                                                    ? "#16a34a"
                                                    : "#0f172a",
                                        }}
                                    >
                                        {item.type === "DEPOSIT" || item.type === "REFUND"
                                            ? "+"
                                            : "-"}
                                        {formatCurrency(item.amount)}
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
                okText="Confirm Deposit"
            >
                <Form form={depositForm} layout="vertical">
                    <Form.Item
                        label="Amount (VND)"
                        name="amount"
                        rules={[{ required: true, message: "Please enter amount" }]}
                    >
                        {/* SỬA LỖI TẠI ĐÂY: Thêm <number> */}
                        <InputNumber<number>
                            style={{ width: "100%" }}
                            min={10000}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) =>
                                value?.replace(/\$\s?|(,*)/g, "") as unknown as number
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label="Payment Method"
                        name="paymentMethod"
                        initialValue="VNPAY"
                    >
                        <Select
                            options={[
                                { label: "VNPay", value: "VNPAY" },
                                { label: "MoMo", value: "MOMO" },
                                { label: "ZaloPay", value: "ZALOPAY" },
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
                        ]}
                    >
                        {/* SỬA LỖI TẠI ĐÂY: Thêm <number> */}
                        <InputNumber<number>
                            style={{ width: "100%" }}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) =>
                                value?.replace(/\$\s?|(,*)/g, "") as unknown as number
                            }
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
                        <Input placeholder="UPPERCASE NAME" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Payment;
