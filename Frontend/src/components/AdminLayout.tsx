import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#ffffff" }}>
      {/* Sidebar cố định bên trái */}
      <aside
        style={{
          width: 260,
          background: "#DBEAFE", // Màu nền xanh nhạt giống Startup
          position: "fixed", // QUAN TRỌNG: Giúp sidebar cố định
          left: 0,
          top: 0,
          height: "100vh", // Chiều cao full màn hình
          overflowY: "auto", // Cho phép cuộn nếu menu quá dài
          zIndex: 10,
          borderRight: "1px solid #e2e8f0", // Thêm đường viền nhẹ cho đẹp
        }}
      >
        <AdminSidebar />
      </aside>

      {/* Nội dung chính nằm bên phải, margin-left bằng chiều rộng sidebar */}
      <div
        style={{
          marginLeft: 260,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        <main
          style={{
            flex: 1,
            padding: 24,
            background: "#f8fafc",
            position: "relative",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
