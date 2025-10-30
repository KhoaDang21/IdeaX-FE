import type { FC } from "react";
import type { ProjectUI } from "../../../interfaces/startup/myprojects";

interface Props {
  metrics: ProjectUI["metrics"];
}

export const ProjectMetrics: FC<Props> = ({ metrics }) => {
  return (
    <div
      style={{
        flex: 2,
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Project Metrics</h3>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div
          style={{
            flex: 1,
            minWidth: 150,
            background: "#eff6ff",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: 0, color: "#3b82f6" }}>
            {metrics.activeInvestors}
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            Active Investors
          </p>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 150,
            background: "#eff6ff",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: 0, color: "#3b82f6" }}>
            {metrics.completedMilestones}/{metrics.totalMilestones}
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            Milestones
          </p>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 150,
            background: "#eff6ff",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: 0, color: "#3b82f6" }}>{metrics.completion}%</h2>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            Completion
          </p>
        </div>
      </div>
    </div>
  );
};
