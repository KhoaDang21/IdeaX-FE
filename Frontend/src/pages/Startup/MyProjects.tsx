import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  BarChartOutlined,
  MessageOutlined,
  UploadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

interface Project {
  id: number;
  title: string;
  status: string;
  progress: number;
  raised: string;
  target: string;
  stage: string;
  timeline: Array<{
    stage: string;
    date: string;
    status: "completed" | "in-progress" | "upcoming";
  }>;
  milestones: Array<{
    label: string;
    due: string;
    checked: boolean;
  }>;
  metrics: {
    activeInvestors: number;
    completedMilestones: number;
    totalMilestones: number;
    completion: number;
    daysLeft: number;
  };
}

const MyProjects: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<number>(1);

  const projects: Project[] = [
    {
      id: 1,
      title: "AI-Powered Analytics Platform",
      status: "In Deal",
      progress: 75,
      raised: "$500K",
      target: "$1000K",
      stage: "Due Diligence",
      timeline: [
        { stage: "Initial Review", date: "2024-01-15", status: "completed" },
        { stage: "Investor Meetings", date: "2024-02-01", status: "completed" },
        { stage: "Due Diligence", date: "2024-02-15", status: "in-progress" },
        { stage: "Term Sheet", date: "2024-03-01", status: "upcoming" },
        { stage: "Final Agreement", date: "2024-03-15", status: "upcoming" },
      ],
      milestones: [
        { label: "Financial documents submitted", due: "2024-02-10", checked: true },
        { label: "Legal review completed", due: "2024-02-12", checked: true },
        { label: "Technical due diligence", due: "2024-02-20", checked: false },
        { label: "Management presentation", due: "2024-02-25", checked: false },
      ],
      metrics: {
        activeInvestors: 3,
        completedMilestones: 2,
        totalMilestones: 4,
        completion: 75,
        daysLeft: -507
      }
    },
    {
      id: 2,
      title: "Green Energy Solutions",
      status: "Waiting for Investor",
      progress: 30,
      raised: "$50K",
      target: "$750K",
      stage: "Initial Review",
      timeline: [
        { stage: "Initial Review", date: "2024-02-01", status: "in-progress" },
        { stage: "Investor Meetings", date: "2024-02-20", status: "upcoming" },
        { stage: "Due Diligence", date: "2024-03-01", status: "upcoming" },
        { stage: "Term Sheet", date: "2024-03-15", status: "upcoming" },
      ],
      milestones: [
        { label: "Business plan submitted", due: "2024-02-05", checked: true },
        { label: "Initial pitch completed", due: "2024-02-08", checked: true },
        { label: "Technical specifications", due: "2024-02-25", checked: false },
      ],
      metrics: {
        activeInvestors: 1,
        completedMilestones: 2,
        totalMilestones: 3,
        completion: 30,
        daysLeft: -487
      }
    },
    {
      id: 3,
      title: "HealthTech Mobile App",
      status: "In Roommeet",
      progress: 60,
      raised: "$250K",
      target: "$500K",
      stage: "Investor Meetings",
      timeline: [
        { stage: "Initial Review", date: "2024-01-20", status: "completed" },
        { stage: "Investor Meetings", date: "2024-02-10", status: "in-progress" },
        { stage: "Due Diligence", date: "2024-02-28", status: "upcoming" },
        { stage: "Term Sheet", date: "2024-03-10", status: "upcoming" },
      ],
      milestones: [
        { label: "Prototype completed", due: "2024-01-25", checked: true },
        { label: "Initial user testing", due: "2024-02-05", checked: true },
        { label: "Investor pitch deck", due: "2024-02-12", checked: true },
        { label: "Financial projections", due: "2024-02-20", checked: false },
      ],
      metrics: {
        activeInvestors: 2,
        completedMilestones: 3,
        totalMilestones: 4,
        completion: 60,
        daysLeft: -497
      }
    }
  ];

  const handleCheckboxChange = (index: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject) {
        const updatedMilestones = project.milestones.map((milestone, i) =>
          i === index ? { ...milestone, checked: !milestone.checked } : milestone
        );
        return { ...project, milestones: updatedMilestones };
      }
      return project;
    });
    // In a real app, you would update state here
    console.log(updatedProjects);
  };

  const handleNewProject = () => {
    navigate("/startup/new-project");
  };

  const selectedProjectData = projects.find(project => project.id === selectedProject) || projects[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Deal": return { background: "#dcfce7", color: "#16a34a" };
      case "Waiting for Investor": return { background: "#fefce8", color: "#d97706" };
      case "In Roommeet": return { background: "#ede9fe", color: "#7c3aed" };
      default: return { background: "#e5e7eb", color: "#6b7280" };
    }
  };

  const getTimelineDotStyle = (status: string) => {
    switch (status) {
      case "completed": return { background: "#3b82f6" };
      case "in-progress": return { background: "#fff", border: "2px solid #3b82f6" };
      case "upcoming": return { background: "#fff", border: "2px solid #64748b" };
      default: return { background: "#fff", border: "2px solid #64748b" };
    }
  };

  const getTimelineTextStyle = (status: string) => {
    switch (status) {
      case "completed": return { color: "#3b82f6" };
      case "in-progress": return { color: "#3b82f6" };
      case "upcoming": return { color: "#64748b" };
      default: return { color: "#64748b" };
    }
  };

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 6,
      }}>
        <div>
          <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: 16, fontWeight: 600 }}>
            Project Status
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Track your project progress and manage milestones
          </p>
        </div>
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
        {projects.map((project) => {
          const statusStyle = getStatusColor(project.status);
          return (
            <div 
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              style={{ 
                flex: 1, 
                minWidth: 250, 
                background: "#fff", 
                borderRadius: 12, 
                padding: 16, 
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: selectedProject === project.id ? "2px solid #3b82f6" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{project.title}</h3>
                <span style={{ 
                  fontSize: 12, 
                  background: statusStyle.background, 
                  color: statusStyle.color, 
                  padding: "2px 8px", 
                  borderRadius: 999 
                }}>
                  {project.status}
                </span>
              </div>
              <p style={{ margin: "8px 0", fontSize: 12, color: "#64748b" }}>Progress {project.progress}%</p>
              <div style={{ height: 6, background: "#e5e7eb", borderRadius: 999 }}>
                <div style={{ 
                  width: `${project.progress}%`, 
                  height: "100%", 
                  background: "#3b82f6", 
                  borderRadius: 999 
                }} />
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 500 }}>
                {project.raised} / {project.target}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Stage: {project.stage}</p>
            </div>
          );
        })}
      </div>

      {/* Middle Section */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
        {/* Timeline */}
        <div style={{ flex: 2, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Project Timeline</h3>
            <h3 style={{ margin: 0, fontSize: 16, marginLeft: "auto" }}>{selectedProjectData.title}</h3>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, position: "relative", paddingLeft: 30 }}>
            {selectedProjectData.timeline.map((item, index) => (
              <li key={index} style={{ marginBottom: 12, position: "relative" }}>
                <span style={{ 
                  position: "absolute", 
                  left: -24, 
                  top: 0, 
                  width: 16, 
                  height: 16, 
                  borderRadius: "50%", 
                  ...getTimelineDotStyle(item.status)
                }}></span>
                <span style={getTimelineTextStyle(item.status)}>{item.stage}</span>
                <span style={{ float: "right", fontSize: 12 }}>{item.date}</span>
                <br />
                {item.status === "completed" && (
                  <span style={{ marginLeft: 0, color: "#16a34a", fontSize: 12, display: "block" }}>Completed</span>
                )}
                {item.status === "in-progress" && (
                  <span style={{ marginLeft: 0, color: "#64748b", fontSize: 12, display: "block" }}>Currently in progress</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Milestones */}
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Milestones</h3>
            <button style={{ fontSize: 12, background: "#3b82f6", color: "#fff", padding: "4px 8px", border: "none", borderRadius: 6, cursor: "pointer" }}>
              Update Milestone
            </button>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {selectedProjectData.milestones.map((milestone, index) => (
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
            <h2 style={{ margin: 0, color: "#3b82f6" }}>{selectedProjectData.metrics.activeInvestors}</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Active Investors</p>
          </div>
          <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <h2 style={{ margin: 0, color: "#3b82f6" }}>
              {selectedProjectData.metrics.completedMilestones}/{selectedProjectData.metrics.totalMilestones}
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Milestones</p>
          </div>
          <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <h2 style={{ margin: 0, color: "#3b82f6" }}>{selectedProjectData.metrics.completion}%</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Completion</p>
          </div>
          <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <h2 style={{ margin: 0, color: selectedProjectData.metrics.daysLeft < 0 ? "#ef4444" : "#3b82f6" }}>
              {selectedProjectData.metrics.daysLeft}
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Days Left</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;