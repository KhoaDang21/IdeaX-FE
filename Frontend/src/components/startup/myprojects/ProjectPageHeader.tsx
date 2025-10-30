import type { FC } from "react";
import { Button } from "antd";

interface Props {
  onNewProject: () => void;
}

export const ProjectPageHeader: FC<Props> = ({ onNewProject }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 6,
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            color: "#1e3a8a",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Project Status
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          Track your project progress and manage milestones
        </p>
      </div>
      <Button
        type="primary"
        onClick={onNewProject}
        style={{ background: "#38bdf8" }}
      >
        New Project
      </Button>
    </div>
  );
};
