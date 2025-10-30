import type { FC } from "react";
import { Card, Button, List } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type { ProjectMilestone } from "../../../interfaces/startup/dashboard";

interface Props {
  milestones: ProjectMilestone[];
}

const milestoneStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircleOutlined style={{ color: "#10b981" }} />;
    case "in-progress":
      return <SyncOutlined spin style={{ color: "#3b82f6" }} />;
    case "upcoming":
      return <ClockCircleOutlined style={{ color: "#6b7280" }} />;
    default:
      return <ClockCircleOutlined />;
  }
};

export const ProjectMilestonesList: FC<Props> = ({ milestones }) => {
  return (
    <Card
      title="Project Milestones"
      extra={
        <Button type="link" size="small">
          See All
        </Button>
      }
      styles={{ body: { padding: "16px 0" } }}
    >
      {milestones.length > 0 ? (
        <List
          dataSource={milestones}
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                    }}
                  >
                    {milestoneStatusIcon(item.status)}
                  </div>
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        flex: 1,
                      }}
                    >
                      {item.milestone}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginLeft: 8,
                      }}
                    >
                      {item.dueDate}
                    </span>
                  </div>
                }
                description={
                  <div style={{ marginTop: 8 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 8,
                        fontWeight: 500,
                      }}
                    >
                      {item.project}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    ></div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: "center", padding: 20 }}>
          <p style={{ color: "#6b7280" }}>No milestones available</p>
        </div>
      )}
    </Card>
  );
};
