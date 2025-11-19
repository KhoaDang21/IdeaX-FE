import React, { useEffect, useMemo, useState } from "react";
import InlineLoading from '../../components/InlineLoading'
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Table, Avatar, Tag, Input, Select, Space, message, Card, Row, Col, Button, Drawer, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    EyeOutlined,
    LockOutlined,
    UnlockOutlined,
    ExclamationCircleOutlined,
    UserOutlined
} from "@ant-design/icons";
import { getAccountsByRole, adminSetStatus } from "../../services/features/auth/accountService";
import { api } from "../../services/constant/axiosInstance";
import {
    STARTUP_PROFILE_GET_ENDPOINT,
    INVESTOR_PROFILE_GET_ENDPOINT,
} from "../../services/constant/apiConfig";
import type { AccountResponse } from "../../interfaces/auth";

const { Option } = Select;

type DisplayUser = {
    id: string | number;
    email: string;
    role: string;
    status: string;
    // common profile fields
    fullName?: string;
    profilePictureUrl?: string;
    joined?: string;
    initials?: string;
    // startup fields
    startupName?: string;
    companyWebsite?: string;
    industryCategory?: string;
    fundingStage?: string;
    location?: string;
    numberOfTeamMembers?: number;
    aboutUs?: string;
    companyLogo?: string;
    // investor fields
    organization?: string;
    investmentFocus?: string;
    investmentRange?: string;
    investmentExperience?: string;
    country?: string;
    phoneNumber?: string;
    linkedInUrl?: string;
    twoFactorEnabled?: boolean;
};

const ROLE_LABEL: Record<string, string> = {
    START_UP: "Startup",
    INVESTOR: "Investor",
    ADMIN: "Admin",
};

const ROLE_COLOR: Record<string, string> = {
    START_UP: '#16a34a', // green
    INVESTOR: '#2563eb', // blue
};

const ROLE_BG: Record<string, string> = {
    START_UP: '#DCFCE7', // light green
    INVESTOR: '#DBEAFE', // light blue
};

const AVATAR_BG: Record<string, string> = {
    START_UP: '#DCFCE7',
    INVESTOR: '#DBEAFE',
};

const STATUS_CONFIG: Record<string, { color: string; text: string; bg: string }> = {
    ACTIVE: { color: "#16a34a", text: "Active", bg: "#DCFCE7" },
    INACTIVE: { color: "#6b7280", text: "Inactive", bg: "#f3f4f6" },
    DELETED: { color: "#ef4444", text: "Deleted", bg: "#FEE2E2" },
    PENDING: { color: "#d97706", text: "Pending", bg: "#FEF3C7" },
    BANNED: { color: "#dc2626", text: "Suspended", bg: "#FEE2E2" },
};

const UserManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<DisplayUser[]>([]);
    const [roleFilter, setRoleFilter] = useState<string | "all">("all");
    const [statusFilter, setStatusFilter] = useState<string | "all">("all");
    const [q, setQ] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null);

    // computed stats from API data
    const statsData = {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === "ACTIVE").length,
        pendingApproval: users.filter((u) => u.status === "PENDING").length,
        suspended: users.filter((u) => u.status === "BANNED").length,
    };

    const [showJoined] = useState(true);
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [alertTarget, setAlertTarget] = useState<DisplayUser | null>(null);
    const [alertMessage, setAlertMessage] = useState("");

    const reduxUser = useSelector((state: RootState) => state.auth.user);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const [startups, investors] = await Promise.all([
                getAccountsByRole("START_UP"),
                getAccountsByRole("INVESTOR"),
            ]);

            const combined: AccountResponse[] = [...startups, ...investors];

            const profiles = await Promise.all(
                combined.map(async (acc) => {
                    try {
                        if (acc.role === "START_UP") {
                            const res = await api.get(STARTUP_PROFILE_GET_ENDPOINT(String(acc.id)));
                            return { id: acc.id, profile: res.data };
                        } else if (acc.role === "INVESTOR") {
                            const res = await api.get(INVESTOR_PROFILE_GET_ENDPOINT(String(acc.id)));
                            return { id: acc.id, profile: res.data };
                        }
                    } catch (e) {
                        return { id: acc.id, profile: null };
                    }
                    return { id: acc.id, profile: null };
                })
            );

            const profileMap = new Map<string | number, any>();
            profiles.forEach((p) => profileMap.set(p.id, p.profile));

            const display: DisplayUser[] = combined.map((acc) => {
                const profile = profileMap.get(acc.id) || {};
                const joinedRaw = (acc as any)?.createdAt || profile?.createdAt || profile?.joinedAt;
                let joined: string | undefined = undefined;
                if (joinedRaw) {
                    try {
                        const d = new Date(joinedRaw);
                        if (!isNaN(d.getTime())) joined = d.toISOString();
                        else joined = String(joinedRaw);
                    } catch (e) {
                        joined = String(joinedRaw);
                    }
                }
                const profilePictureUrl = profile?.profilePictureUrl
                    ? profile.profilePictureUrl.startsWith("http")
                        ? profile.profilePictureUrl
                        : `${location.origin}${profile.profilePictureUrl}`
                    : undefined;

                const initials = profile?.fullName
                    ? profile.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                    : acc.email.substring(0, 2).toUpperCase();

                return {
                    id: acc.id,
                    email: acc.email,
                    role: acc.role,
                    status: String(acc.status),
                    fullName: profile?.fullName || undefined,
                    profilePictureUrl,
                    joined,
                    initials,
                    startupName: profile?.startupName,
                    companyWebsite: profile?.companyWebsite,
                    industryCategory: profile?.industryCategory,
                    fundingStage: profile?.fundingStage,
                    location: profile?.location,
                    numberOfTeamMembers: profile?.numberOfTeamMembers,
                    aboutUs: profile?.aboutUs,
                    companyLogo: profile?.companyLogo,
                    organization: profile?.organization,
                    investmentFocus: profile?.investmentFocus,
                    investmentRange: profile?.investmentRange,
                    investmentExperience: profile?.investmentExperience,
                    country: profile?.country || profile?.country,
                    phoneNumber: profile?.phoneNumber || profile?.phoneNumber,
                    linkedInUrl: profile?.linkedInUrl || profile?.linkedInProfile,
                    twoFactorEnabled: profile?.twoFactorEnabled,
                };
            });

            setUsers(display);
        } catch (err: any) {
            console.error(err);
            message.error("Không thể tải danh sách tài khoản");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    let columns: ColumnsType<DisplayUser> = [
        {
            title: "User",
            dataIndex: "fullName",
            key: "user",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Avatar
                        src={record.profilePictureUrl}
                        style={{
                            backgroundColor: AVATAR_BG[record.role] || '#f3f4f6',
                            border: `1px solid ${ROLE_COLOR[record.role] || '#d1d5db'}`
                        }}
                        icon={!record.profilePictureUrl ? <UserOutlined style={{ color: ROLE_COLOR[record.role] || '#6b7280' }} /> : undefined}
                    >
                        {!record.profilePictureUrl ? record.initials : undefined}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.fullName || record.email}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {record.role === 'START_UP' && record.startupName ? record.startupName : ''}
                            {record.role === 'INVESTOR' && record.organization ? record.organization : ''}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            width: 120,
            render: (r: string) => (
                <Tag
                    color="default"
                    style={{
                        background: ROLE_BG[r] || '#f3f4f6',
                        color: ROLE_COLOR[r] || '#6b7280',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 500
                    }}
                >
                    {ROLE_LABEL[r] || r}
                </Tag>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 220,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            align: 'center',
            render: (s: string) => {
                const config = STATUS_CONFIG[s] || { color: "#6b7280", text: s, bg: "#f3f4f6" };
                return (
                    <Tag
                        color="default"
                        style={{
                            background: config.bg,
                            color: config.color,
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 500,
                            minWidth: '80px',
                            textAlign: 'center'
                        }}
                    >
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            width: 200,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleView(record)}
                    >
                        View
                    </Button>
                    <Button
                        type="text"
                        icon={record.status === "BANNED" ? <UnlockOutlined /> : <LockOutlined />}
                        size="small"
                        onClick={() => handleLock(record)}
                    >
                        {record.status === "BANNED" ? "Unlock" : "Lock"}
                    </Button>
                    <Button
                        type="text"
                        icon={<ExclamationCircleOutlined />}
                        size="small"
                        onClick={() => {
                            setAlertTarget(record);
                            setAlertModalOpen(true);
                        }}
                    >
                        Alert
                    </Button>
                </Space>
            ),
        },
    ];

    if (showJoined) {
        const joinedCol = {
            title: "Joined",
            dataIndex: "joined",
            key: "joined",
            width: 120,
            align: 'center' as const,
            render: (d: string | undefined) => (d ? new Date(d).toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : "-"),
        };
        // find index of Status column
        const statusIndex = columns.findIndex(c => c.key === 'status');
        if (statusIndex >= 0) columns.splice(statusIndex + 1, 0, joinedCol);
    }

    const filtered = useMemo(() => {
        const list = users.filter((u) => {
            if (roleFilter !== "all" && u.role !== roleFilter) return false;
            if (statusFilter !== "all" && u.status !== statusFilter) return false;
            if (q) {
                const ql = q.toLowerCase();
                if (!((u.fullName || "").toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql))) return false;
            }
            return true;
        });

        // Sort by joined date (newest first). If joined missing, treat as very old so it appears last.
        return list.slice().sort((a, b) => {
            const ta = a.joined ? Date.parse(a.joined) : Number.NEGATIVE_INFINITY;
            const tb = b.joined ? Date.parse(b.joined) : Number.NEGATIVE_INFINITY;
            return tb - ta;
        });
    }, [users, roleFilter, statusFilter, q]);

    // Handler functions for actions
    const handleView = (user: DisplayUser) => {
        setSelectedUser(user);
        setDrawerOpen(true);
    };

    const handleLock = async (user: DisplayUser) => {
        const adminId = reduxUser?.id;
        if (!adminId) {
            message.error("Bạn phải là admin để thực hiện hành động này");
            return;
        }
        const newStatus = user.status === "BANNED" ? "ACTIVE" : "BANNED";
        const prevUsers = users;
        setUsers((u) => u.map((it) => (it.id === user.id ? { ...it, status: newStatus } : it)));
        try {
            setLoading(true);
            await adminSetStatus(String(adminId), String(user.id), newStatus);
            message.success(`${newStatus === "BANNED" ? "Locked" : "Unlocked"} ${user.email}`);
        } catch (err: any) {
            console.error(err);
            setUsers(prevUsers);
            message.error(err?.response?.data?.message || "Thao tác thất bại");
            await fetchUsers();
        } finally {
            setLoading(false);
        }
    };

    const sendAlert = async () => {
        if (!alertTarget) return;
        setLoading(true);
        try {
            message.success(`Alert sent to ${alertTarget.email}`);
            setAlertModalOpen(false);
            setAlertTarget(null);
            setAlertMessage("");
        } catch (err: any) {
            message.error(err?.message || 'Failed to send alert');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>User Management</h1>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                    Manage platform users, monitor activity, and handle account approvals
                </p>
            </div>

            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card bodyStyle={{ padding: '16px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{statsData.totalUsers}</div>
                        <div style={{ color: '#666' }}>Total Users</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bodyStyle={{ padding: '16px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{statsData.activeUsers}</div>
                        <div style={{ color: '#666' }}>Active Users</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bodyStyle={{ padding: '16px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{statsData.pendingApproval}</div>
                        <div style={{ color: '#666' }}>Pending Approval</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bodyStyle={{ padding: '16px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{statsData.suspended}</div>
                        <div style={{ color: '#666' }}>Suspended</div>
                    </Card>
                </Col>
            </Row>

            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ marginBottom: '16px', fontWeight: '600', fontSize: '16px' }}>User Directory</div>

                <Space style={{ marginBottom: 16 }}>
                    <Select
                        value={roleFilter}
                        onChange={(v) => setRoleFilter(v)}
                        style={{ width: 160 }}
                        placeholder="Filter by role"
                    >
                        <Option value="all">All Roles</Option>
                        <Option value="START_UP">Startup</Option>
                        <Option value="INVESTOR">Investor</Option>
                    </Select>

                    <Select
                        value={statusFilter}
                        onChange={(v) => setStatusFilter(v)}
                        style={{ width: 160 }}
                        placeholder="Filter by status"
                    >
                        <Option value="all">All Status</Option>
                        <Option value="ACTIVE">Active</Option>
                        <Option value="PENDING">Pending</Option>
                        <Option value="BANNED">Suspended</Option>
                        <Option value="INACTIVE">Inactive</Option>
                    </Select>

                    <Input.Search
                        placeholder="Search users..."
                        onSearch={(val) => setQ(val)}
                        onChange={(e) => setQ(e.target.value)}
                        allowClear
                        style={{ width: 300 }}
                    />
                </Space>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <InlineLoading />
                    </div>
                ) : (
                    <Table<DisplayUser>
                        columns={columns}
                        dataSource={filtered}
                        rowKey={(r) => String(r.id)}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} items`
                        }}
                        scroll={{ x: 1000 }}
                    />
                )}

                <Drawer
                    width={480}
                    placement="right"
                    onClose={() => setDrawerOpen(false)}
                    open={drawerOpen}
                    title={selectedUser ? (selectedUser.fullName || selectedUser.email) : 'User'}
                >
                    {selectedUser ? (
                        <div>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <strong>Email:</strong> {selectedUser.email}
                                </div>
                                <div>
                                    <strong>Role:</strong> {ROLE_LABEL[selectedUser.role] || selectedUser.role}
                                </div>
                                <div>
                                    <strong>Status:</strong> {selectedUser.status}
                                </div>
                                <div>
                                    <strong>Joined:</strong> {selectedUser.joined ? new Date(selectedUser.joined).toLocaleString() : '-'}
                                </div>

                                {/* Startup fields */}
                                {selectedUser.startupName && (
                                    <div>
                                        <strong>Startup Name:</strong> {selectedUser.startupName}
                                    </div>
                                )}
                                {selectedUser.companyWebsite && (
                                    <div>
                                        <strong>Website:</strong> <a href={selectedUser.companyWebsite} target="_blank" rel="noreferrer">{selectedUser.companyWebsite}</a>
                                    </div>
                                )}
                                {selectedUser.industryCategory && (
                                    <div>
                                        <strong>Industry:</strong> {selectedUser.industryCategory}
                                    </div>
                                )}
                                {selectedUser.fundingStage && (
                                    <div>
                                        <strong>Funding Stage:</strong> {selectedUser.fundingStage}
                                    </div>
                                )}
                                {selectedUser.numberOfTeamMembers !== undefined && (
                                    <div>
                                        <strong>Team Size:</strong> {selectedUser.numberOfTeamMembers}
                                    </div>
                                )}
                                {selectedUser.aboutUs && (
                                    <div>
                                        <strong>About:</strong>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{selectedUser.aboutUs}</div>
                                    </div>
                                )}

                                {/* Investor fields */}
                                {selectedUser.organization && (
                                    <div>
                                        <strong>Organization:</strong> {selectedUser.organization}
                                    </div>
                                )}
                                {selectedUser.investmentFocus && (
                                    <div>
                                        <strong>Investment Focus:</strong> {selectedUser.investmentFocus}
                                    </div>
                                )}
                                {selectedUser.investmentRange && (
                                    <div>
                                        <strong>Investment Range:</strong> {selectedUser.investmentRange}
                                    </div>
                                )}
                                {selectedUser.investmentExperience && (
                                    <div>
                                        <strong>Experience:</strong> {selectedUser.investmentExperience}
                                    </div>
                                )}
                                {selectedUser.country && (
                                    <div>
                                        <strong>Country:</strong> {selectedUser.country}
                                    </div>
                                )}
                                {selectedUser.phoneNumber && (
                                    <div>
                                        <strong>Phone:</strong> {selectedUser.phoneNumber}
                                    </div>
                                )}
                                {selectedUser.linkedInUrl && (
                                    <div>
                                        <strong>LinkedIn:</strong> <a href={selectedUser.linkedInUrl} target="_blank" rel="noreferrer">{selectedUser.linkedInUrl}</a>
                                    </div>
                                )}
                            </Space>
                        </div>
                    ) : null}
                </Drawer>

                <Modal
                    title={alertTarget ? `Alert ${alertTarget.fullName || alertTarget.email}` : 'Send Alert'}
                    open={alertModalOpen}
                    onOk={sendAlert}
                    onCancel={() => { setAlertModalOpen(false); setAlertTarget(null); setAlertMessage(""); }}
                >
                    <div>
                        <textarea
                            rows={4}
                            style={{ width: '100%', padding: 8 }}
                            placeholder='Thông điệp gửi tới user'
                            value={alertMessage}
                            onChange={(e) => setAlertMessage(e.target.value)}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default UserManagement;