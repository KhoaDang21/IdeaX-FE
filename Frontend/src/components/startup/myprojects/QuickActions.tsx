import type { FC } from "react";
import { Button } from "antd";
import {
  BarChartOutlined,
  MessageOutlined,
  UploadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

export const QuickActions: FC = () => {
  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Quick Actions</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Button
          icon={<BarChartOutlined style={{ color: "#16a34a" }} />}
          style={{ textAlign: "left" }}
        >
          View Analytics
        </Button>
        <Button
          icon={<MessageOutlined style={{ color: "#3b82f6" }} />}
          style={{ textAlign: "left" }}
        >
          Message Investors
        </Button>
        <Button
          icon={<UploadOutlined style={{ color: "#64748b" }} />}
          style={{ textAlign: "left" }}
        >
          Upload Documents
        </Button>
        <Button
          icon={<PlusCircleOutlined style={{ color: "red" }} />}
          style={{ textAlign: "left" }}
        >
          Set Goals
        </Button>
      </div>
    </div>
  );
};
