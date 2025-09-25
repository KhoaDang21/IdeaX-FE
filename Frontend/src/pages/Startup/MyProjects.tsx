import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate từ react-router-dom
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  BarChartOutlined,
  MessageOutlined,
  UploadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

const MyProjects: React.FC = () => {
  const navigate = useNavigate(); // Hook để điều hướng
  const [milestones, setMilestones] = useState([
    { label: "Financial documents submitted", due: "2024-02-10", checked: true },
    { label: "Legal review completed", due: "2024-02-12", checked: true },
    { label: "Technical due diligence", due: "2024-02-20", checked: false },
    { label: "Management presentation", due: "2024-02-25", checked: false },
  ]);

  const handleCheckboxChange = (index: number) => {
    const updatedMilestones = milestones.map((milestone, i) =>
      i === index ? { ...milestone, checked: !milestone.checked } : milestone
    );
    setMilestones(updatedMilestones);
  };

  // Hàm xử lý khi nhấn "New Project"
  const handleNewProject = () => {
    navigate("/startup/new-project"); // Điều hướng đến route "startup/new-project"
  };

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
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
    <p
      style={{
        margin: 0,
        fontSize: 13,
        color: "#6b7280",
      }}
    >
      Track your project progress and manage milestones
    </p>
  </div>

  {/* Bên phải: nút */}
  <button
    onClick={handleNewProject}
    style={{
      padding: "6px 16px",
      background: "#38bdf8",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 500,
    }}
  >
    New Project
  </button>
</div>

      {/* Top - Project Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {/* Card 1 */}
        <div style={{ flex: 1, minWidth: 250, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>AI-Powered Analytics Platform</h3>
            <span style={{ fontSize: 12, background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: 999 }}>In Deal</span>
          </div>
          <p style={{ margin: "8px 0", fontSize: 12, color: "#64748b" }}>Progress 75%</p>
          <div style={{ height: 6, background: "#e5e7eb", borderRadius: 999 }}>
            <div style={{ width: "75%", height: "100%", background: "#3b82f6", borderRadius: 999 }} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 500 }}>$500K / $1000K</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Stage: Due Diligence</p>
        </div>

        {/* Card 2 */}
        <div style={{ flex: 1, minWidth: 250, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Green Energy Solutions</h3>
            <span style={{ fontSize: 12, background: "#fefce8", color: "#d97706", padding: "2px 8px", borderRadius: 999 }}>Waiting for Investor</span>
          </div>
          <p style={{ margin: "8px 0", fontSize: 12, color: "#64748b" }}>Progress 30%</p>
          <div style={{ height: 6, background: "#e5e7eb", borderRadius: 999 }}>
            <div style={{ width: "30%", height: "100%", background: "#3b82f6", borderRadius: 999 }} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 500 }}>$50K / $750K</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Stage: Initial Review</p>
        </div>

        {/* Card 3 */}
        <div style={{ flex: 1, minWidth: 250, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>HealthTech Mobile App</h3>
            <span style={{ fontSize: 12, background: "#ede9fe", color: "#7c3aed", padding: "2px 8px", borderRadius: 999 }}>In Roommeet</span>
          </div>
          <p style={{ margin: "8px 0", fontSize: 12, color: "#64748b" }}>Progress 60%</p>
          <div style={{ height: 6, background: "#e5e7eb", borderRadius: 999 }}>
            <div style={{ width: "60%", height: "100%", background: "#3b82f6", borderRadius: 999 }} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 500 }}>$250K / $500K</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Stage: Investor Meetings</p>
        </div>
      </div>

      {/* Middle Section */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
        {/* Timeline */}
        <div style={{ flex: 2, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Project Timeline</h3>
            <h3 style={{ margin: 0, fontSize: 16, marginLeft: "auto" }}>AI-Powered Analytics Platform</h3>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, position: "relative", paddingLeft: 30 }}>
            <li style={{ marginBottom: 12, position: "relative" }}>
              <span style={{ position: "absolute", left: -24, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#3b82f6" }}></span>
              <span style={{ color: "#3b82f6" }}>Initial Review</span>
              <span style={{ float: "right", fontSize: 12 }}>2024-01-15</span>
              <br />
              <span style={{ marginLeft: 0, color: "#16a34a", fontSize: 12, display: "block" }}>Completed</span>
            </li>
            <li style={{ marginBottom: 12, position: "relative" }}>
              <span style={{ position: "absolute", left: -24, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#3b82f6" }}></span>
              <span style={{ color: "#3b82f6" }}>Investor Meetings</span>
              <span style={{ float: "right", fontSize: 12 }}>2024-02-01</span>
              <br />
              <span style={{ marginLeft: 0, color: "#16a34a", fontSize: 12, display: "block" }}>Completed</span>
            </li>
            <li style={{ marginBottom: 12, position: "relative" }}>
              <span style={{ position: "absolute", left: -24, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2px solid #3b82f6" }}></span>
              <span style={{ color: "#3b82f6" }}>Due Diligence</span>
              <span style={{ float: "right", fontSize: 12 }}>2024-02-15</span>
              <br />
              <span style={{ marginLeft: 0, color: "#64748b", fontSize: 12, display: "block" }}>Currently in progress</span>
            </li>
            <li style={{ marginBottom: 12, position: "relative" }}>
              <span style={{ position: "absolute", left: -24, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2px solid #64748b" }}></span>
              <span style={{ color: "#64748b" }}>Term Sheet</span>
              <span style={{ float: "right", fontSize: 12 }}>2024-03-01</span>
            </li>
            <li style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: -24, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2px solid #64748b" }}></span>
              <span style={{ color: "#64748b" }}>Final Agreement</span>
              <span style={{ float: "right", fontSize: 12 }}>2024-03-15</span>
            </li>
          </ul>
        </div>

        {/* Milestones */}
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Milestones</h3>
            <button style={{ fontSize: 12, background: "#3b82f6", color: "#fff", padding: "4px 8px", border: "none", borderRadius: 6, cursor: "pointer" }}>Update Milestone</button>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {milestones.map((milestone, index) => (
              <li key={index} style={{ marginBottom: 8 }}>
                <span
                  style={{
                    marginRight: 8,
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: milestone.checked ? "#3b82f6" : "white",
                    border: milestone.checked ? "none" : "1px solid #d1d5db",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={() => handleCheckboxChange(index)}
                >
                  {milestone.checked && (
                    <span style={{ position: "absolute", top: -2, left: 3, color: "white", fontSize: 14 }}>✓</span>
                  )}
                </span>
                {milestone.label}
                {milestone.checked && <CheckCircleFilled style={{ color: "#16a34a", marginLeft: 8, verticalAlign: "middle" }} />}
                <div style={{ marginLeft: 24, fontSize: 12, color: "#64748b" }}>Due: {milestone.due}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ flex: 2 }}></div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button style={{ border: "none", borderRadius: 6, padding: "6px 12px", background: "#eff6ff", cursor: "pointer", textAlign: "left" }}>
              <BarChartOutlined style={{ marginRight: 8, color: "#16a34a" }} /> View Analytics
            </button>
            <button style={{ border: "none", borderRadius: 6, padding: "6px 12px", background: "#eff6ff", cursor: "pointer", textAlign: "left" }}>
              <MessageOutlined style={{ marginRight: 8, color: "#3b82f6" }} /> Message Investors
            </button>
            <button style={{ border: "none", borderRadius: 6, padding: "6px 12px", background: "#eff6ff", cursor: "pointer", textAlign: "left" }}>
              <UploadOutlined style={{ marginRight: 8, color: "#64748b" }} /> Upload Documents
            </button>
            <button style={{ border: "none", borderRadius: 6, padding: "6px 12px", background: "#eff6ff", cursor: "pointer", textAlign: "left" }}>
              <PlusCircleOutlined style={{ marginRight: 8, color: "red" }} /> Set Goals
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Project Metrics</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <h2 style={{ margin: 0, color: "#3b82f6" }}>3</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Active Investors</p>
          </div>
          <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <h2 style={{ margin: 0, color: "#3b82f6" }}>2/4</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Milestones</p>
          </div>
          <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <h2 style={{ margin: 0, color: "#3b82f6" }}>75%</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Completion</p>
          </div>
          <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <h2 style={{ margin: 0, color: "#ef4444" }}>-507</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Days Left</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;