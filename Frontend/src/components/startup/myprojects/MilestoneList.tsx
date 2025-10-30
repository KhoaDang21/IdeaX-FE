import type { FC } from "react";
import { Button, Popconfirm } from "antd"; // Import Popconfirm and message
import { DeleteOutlined } from "@ant-design/icons"; // Import DeleteOutlined
import type { MilestoneUI } from "../../../interfaces/startup/myprojects";

interface Props {
  milestones: MilestoneUI[];
  onAddMilestone: () => void;
  onDeleteMilestone: (milestoneId: number) => void; // <-- THÊM PROP MỚI
}

export const MilestoneList: FC<Props> = ({
  milestones,
  onAddMilestone,
  onDeleteMilestone, // <-- NHẬN PROP MỚI
}) => {
  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        minHeight: 250,
        maxHeight: 250,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, color: "#1e3a8a" }}>
          Milestones
        </h3>
        <Button
          type="primary"
          size="small"
          onClick={onAddMilestone}
          style={{
            background: "#3b82f6",
            borderRadius: 6,
            padding: "2px 10px",
            fontSize: 12,
          }}
        >
          Add Milestone
        </Button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: 4,
          maxHeight: "calc(100% - 40px)",
        }}
      >
        {milestones.length > 0 ? (
          milestones.map((milestone, index) => (
            <div
              key={milestone.id} // <-- SỬ DỤNG ID LÀM KEY
              style={{
                background: index % 2 === 0 ? "#f9fafb" : "#f3f4f6",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 8,
                borderLeft: "4px solid #3b82f6",
                transition: "all 0.2s ease",
                minHeight: 40,
                display: "flex", // <-- Thêm flex để căn chỉnh nút xóa
                justifyContent: "space-between", // <-- Căn chỉnh nút xóa sang phải
                alignItems: "center", // <-- Căn giữa theo chiều dọc
              }}
            >
              <div style={{ flex: 1, marginRight: "8px" }}>
                {" "}
                {/* Container cho text */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#111827",
                      fontSize: 13,
                      flex: 1,
                      wordBreak: "break-word",
                    }}
                  >
                    {milestone.label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#3b82f6",
                      fontWeight: 500,
                      marginLeft: 8,
                      flexShrink: 0,
                    }}
                  >
                    {milestone.due}
                  </span>
                </div>
                {/* Optionally display description if needed */}
                {/* <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{milestone.description}</p> */}
              </div>
              {/* --- NÚT XÓA --- */}
              <Popconfirm
                title="Delete this milestone?"
                onConfirm={() => onDeleteMilestone(milestone.id)} // <-- GỌI HÀM XÓA VỚI ID
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{ flexShrink: 0 }} // Ngăn nút bị co lại
                />
              </Popconfirm>
              {/* --- KẾT THÚC NÚT XÓA --- */}
            </div>
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 13,
              padding: "20px 0",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            No milestones yet.
            <br />
            <span
              style={{ color: "#3b82f6", cursor: "pointer" }}
              onClick={onAddMilestone}
            >
              Click here to add one!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
