import type { FC } from "react";
import { Card, Button, List } from "antd";
import {
  UserAddOutlined,
  TeamOutlined,
  FileOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined, // Import Delete icon
} from "@ant-design/icons";
import type { Activity } from "../../../interfaces/startup/dashboard";

interface Props {
  activities: Activity[];
  onViewAll: () => void; // <-- THÊM PROP MỚI ĐỂ MỞ MODAL
}

// Helper function để render icons (có thể giữ lại hoặc import từ file dùng chung)
const renderActivityIcon = (icon: string) => {
  const iconProps = { style: { fontSize: 18, color: "#3b82f6" } };

  switch (icon) {
    case "user-add":
      return <UserAddOutlined {...iconProps} />;
    case "team":
      return <TeamOutlined {...iconProps} />;
    case "file":
      return <FileOutlined {...iconProps} />;
    case "calendar":
      return <CalendarOutlined {...iconProps} />;
    case "dollar":
      return <DollarCircleOutlined {...iconProps} />;
    case "check":
      return <CheckCircleOutlined {...iconProps} />;
    case "delete": // Thêm case cho delete
      return (
        <DeleteOutlined
          {...iconProps}
          style={{ ...iconProps.style, color: "#ef4444" }}
        />
      );
    default:
      return <FileOutlined {...iconProps} />;
  }
};

export const RecentActivityList: FC<Props> = ({ activities, onViewAll }) => {
  // <-- NHẬN PROP MỚI
  // Hiển thị tối đa 5 hoạt động gần nhất trong danh sách chính
  const recentActivities = activities.slice(0, 5);

  return (
    <Card
      title="Recent Activity"
      extra={
        // Sửa Button để gọi onViewAll khi click
        <Button type="link" size="small" onClick={onViewAll}>
          View All
        </Button>
      }
      styles={{ body: { padding: "8px 0" } }}
    >
      {recentActivities.length > 0 ? ( // Sử dụng recentActivities thay vì activities
        <List
          dataSource={recentActivities} // Chỉ hiển thị 5 item gần nhất
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {renderActivityIcon(item.icon)}
                  </div>
                }
                title={
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.4,
                      color: "#1f2937",
                    }}
                  >
                    {item.title}
                  </div>
                }
                description={
                  <div style={{ marginTop: 4 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 2,
                        fontWeight: 500,
                      }}
                    >
                      {item.project}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        fontWeight: 500,
                      }}
                    >
                      {item.timestamp}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: "center", padding: 20 }}>
          <p style={{ color: "#6b7280" }}>No recent activities</p>
        </div>
      )}
    </Card>
  );
};
