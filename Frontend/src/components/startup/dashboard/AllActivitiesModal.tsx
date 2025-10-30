import type { FC } from "react";
import { Modal, List, Empty } from "antd"; // Import Empty for no data case
import {
  UserAddOutlined,
  TeamOutlined,
  FileOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined, // Add icon for delete actions
} from "@ant-design/icons";
import type { Activity } from "../../../interfaces/startup/dashboard"; // Assuming Activity interface is here

interface Props {
  visible: boolean;
  activities: Activity[];
  onClose: () => void;
}

// Helper function to render icons (can be shared or duplicated)
const renderActivityIcon = (icon: string) => {
  const iconProps = { style: { fontSize: 18, color: "#3b82f6" } };

  switch (icon) {
    case "user-add": // Project created
      return <UserAddOutlined {...iconProps} />;
    case "team": // Investor related (example)
      return <TeamOutlined {...iconProps} />;
    case "file": // Document related (example)
      return <FileOutlined {...iconProps} />;
    case "calendar": // Date related (example)
      return <CalendarOutlined {...iconProps} />;
    case "dollar": // Funding related (example)
      return <DollarCircleOutlined {...iconProps} />;
    case "check": // Milestone created/completed
      return <CheckCircleOutlined {...iconProps} />;
    case "delete": // Project/Milestone deleted
      return (
        <DeleteOutlined
          {...iconProps}
          style={{ ...iconProps.style, color: "#ef4444" }}
        />
      ); // Red color for delete
    default:
      return <FileOutlined {...iconProps} />;
  }
};

export const AllActivitiesModal: FC<Props> = ({
  visible,
  activities,
  onClose,
}) => {
  return (
    <Modal
      title="All Recent Activities"
      open={visible} // Use 'open' instead of 'visible' for newer Ant Design versions
      onCancel={onClose}
      footer={null} // No need for OK/Cancel buttons
      width={600} // Adjust width as needed
      // FIX: Replace destroyOnClose with destroyOnHidden
      destroyOnHidden // Reset state when modal is fully hidden
      // FIX: Replace bodyStyle with styles.body
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" }, // Make list scrollable
      }}
    >
      {activities.length > 0 ? (
        <List
          dataSource={activities} // Use the full list passed via props
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "12px 0", // Slightly less padding for modal list
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 32, // Smaller avatar in modal
                      height: 32,
                      borderRadius: "50%",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px", // Add some margin
                    }}
                  >
                    {/* Update icon logic based on activity action/type */}
                    {renderActivityIcon(item.icon)}
                  </div>
                }
                title={
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500, // Slightly less bold
                      lineHeight: 1.4,
                      color: "#1f2937",
                      marginBottom: "2px",
                    }}
                  >
                    {item.title}
                  </div>
                }
                description={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        fontWeight: 400, // Normal weight
                      }}
                    >
                      {item.project} {/* Display project context */}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        fontWeight: 400, // Normal weight
                      }}
                    >
                      {item.timestamp} {/* Display relative time */}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No recent activities found" /> // Show Empty state if no activities
      )}
    </Modal>
  );
};
