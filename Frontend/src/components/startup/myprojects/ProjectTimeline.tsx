import type { FC } from "react";
import type { ProjectUI } from "../../../interfaces/startup/myprojects";

// Helpers cho component này
const getTimelineDotStyle = (
  status: "completed" | "in-progress" | "upcoming"
) => {
  switch (status) {
    case "completed":
      return { background: "#3b82f6" };
    case "in-progress":
      return { background: "#fff", border: "2px solid #3b82f6" };
    default:
      return { background: "#fff", border: "2px solid #64748b" };
  }
};

const getTimelineTextStyle = (
  status: "completed" | "in-progress" | "upcoming"
) => {
  switch (status) {
    case "completed":
    case "in-progress":
      return { color: "#3b82f6" };
    default:
      return { color: "#64748b" };
  }
};

interface Props {
  title: string;
  timeline: ProjectUI["timeline"];
}

export const ProjectTimeline: FC<Props> = ({ title, timeline }) => {
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16 }}>Project Timeline</h3>
        <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          position: "relative",
          paddingLeft: 30,
        }}
      >
        {timeline.map((item, index) => (
          <li key={index} style={{ marginBottom: 16, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: -24,
                top: 2,
                width: 16,
                height: 16,
                borderRadius: "50%",
                ...getTimelineDotStyle(item.status),
              }}
            ></span>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={getTimelineTextStyle(item.status)}>
                {item.stage}
              </span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {item.date || "Pending"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {item.status === "completed" && "Completed"}
              {item.status === "in-progress" && "Currently in progress"}
              {item.status === "upcoming" && "Not started"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
