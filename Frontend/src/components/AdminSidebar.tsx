import type { FC, CSSProperties, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  FolderCog,
  Wallet,
  FileText,
  LogOut,
  CreditCard,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { App } from "antd";
import { logout } from "../services/features/auth/authSlice";
import logo from "../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg";

const card: CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const NavItem: FC<{ to: string; icon: ReactNode; label: string }> = ({
  to,
  icon,
  label,
}) => {
  const { pathname } = useLocation();
  // Kiểm tra active chính xác hơn (bao gồm cả sub-routes nếu cần)
  const active = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      state={{ skipDelay: true }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        textDecoration: "none",
        color: active ? "#fff" : "#1e293b",
        background: active ? "#34419A" : "transparent",
        padding: "12px 16px",
        borderRadius: 12,
        fontWeight: 500,
        transition: "all 0.2s ease",
        fontSize: "14px",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
};

const AdminSidebar: FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const getInitials = (name?: string, email?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : email
      ? email.slice(0, 2).toUpperCase()
      : "AD";

  const menuItems = [
    {
      to: "/admin/user-management",
      icon: <Users size={20} />,
      label: "User Management",
    },
    {
      to: "/admin/project-management",
      icon: <FolderCog size={20} />,
      label: "Project Management",
    },
    {
      to: "/admin/withdrawals",
      icon: <CreditCard size={20} />,
      label: "Withdrawal Requests",
    },
    {
      to: "/admin/financial-management",
      icon: <Wallet size={20} />,
      label: "Financial Management",
    },
    {
      to: "/admin/room-and-contract",
      icon: <FileText size={20} />,
      label: "Rooms Management",
    },
  ];

  const handleLogout = () => {
    message.success({
      content: "Logged out successfully",
      key: "logout",
      duration: 1.2,
    });
    dispatch(logout());
    setTimeout(() => {
      navigate("/login");
    }, 800);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%", // Quan trọng: Chiếm full chiều cao của thẻ aside cha
        padding: "20px 16px",
      }}
    >
      {/* Top Section */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Logo */}
        <div style={{ marginBottom: 24, paddingLeft: 4 }}>
          <img
            src={logo}
            alt="Idea Logo"
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              objectFit: "cover",
            }}
          />
        </div>

        {/* User Profile Card */}
        <div style={{ ...card, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt="avatar"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: "#34419A",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {getInitials(user?.fullName, user?.email)}
              </div>
            )}
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.fullName || "Admin User"}
              </div>
              <div style={{ color: "#64748b", fontSize: 12 }}>Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Menu Label */}
        <div
          style={{
            marginBottom: 12,
            paddingLeft: 12,
            color: "#64748b",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Menu
        </div>

        {/* Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {menuItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </div>

      {/* Logout Button (Bottom) */}
      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "1px solid #fee2e2",
            background: "#fff",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
