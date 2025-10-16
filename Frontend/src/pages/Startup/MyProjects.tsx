import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircleFilled,
  BarChartOutlined,
  MessageOutlined,
  UploadOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Popconfirm, message } from "antd";
import type { RootState } from "../../store";
import { getMyProjects, updateMilestone, getMilestonesByProject, deleteProject } from "../../services/features/project/projectSlice";
import type { Project as ApiProject } from "../../interfaces/project";

// Interface cho UI
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
  };
}

const MyProjects: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [deletingProjectIds, setDeletingProjectIds] = useState<number[]>([]);
  
  const { projects: apiProjects, milestones: apiMilestones, status, error } = useSelector((state: RootState) => state.project);
  
  // Transform dữ liệu từ API thành định dạng UI
  const transformApiProjectsToUI = (apiProjects: ApiProject[]): Project[] => {
    if (!apiProjects || apiProjects.length === 0) return [];

    return apiProjects.map(project => {
      const projectMilestones = getProjectMilestones(project.id);
      const completedMilestones = projectMilestones.filter(m => m.checked).length;
      const totalMilestones = projectMilestones.length;
      const timeline = generateTimeline(project);
      const completion = calculateCompletionFromTimeline(timeline);

      return {
        id: project.id,
        title: project.projectName || "Untitled Project",
        status: project.status || "Unknown",
        progress: calculateProgressFromTimeline(timeline),
        raised: formatCurrency(project.fundingAmount || 0),
        target: getFundingRangeDisplay(project.fundingRange),
        stage: mapFundingStageToUI(project.fundingStage),
        timeline: timeline,
        milestones: projectMilestones,
        metrics: {
          activeInvestors: project.investorClicks || 0, // Lấy từ dữ liệu thực tế
          completedMilestones,
          totalMilestones,
          completion,
        }
      };
    });
  };

  // Hàm hiển thị fundingRange từ API
  const getFundingRangeDisplay = (fundingRange: string): string => {
    const rangeMap: { [key: string]: string } = {
      'UNDER_50K': 'UNDER $50K',
      'FROM_50K_TO_200K': '$50K - $200K',
      'FROM_200K_TO_1M': '$200K - $1M',
      'OVER_1M': 'Over $1M'
    };
    return rangeMap[fundingRange] || 'Not specified';
  };

  // Hàm get status text - CẬP NHẬT THEO YÊU CẦU
  const getStatusText = (status: string): string => {
    switch (status.toUpperCase()) {
      case "APPROVED": return "In Deal";
      case "DRAFT": return "Pending Review";
      case "PUBLISHED": return "Active";
      case "REJECTED": return "Rejected";
      default: return status;
    }
  };

  // Hàm tính progress dựa trên timeline
  const calculateProgressFromTimeline = (timeline: Array<{ stage: string; date: string; status: "completed" | "in-progress" | "upcoming" }>): number => {
    const completedStages = timeline.filter(stage => stage.status === "completed").length;
    const inProgressStages = timeline.filter(stage => stage.status === "in-progress").length;
    
    // Mỗi stage completed = 20%, stage in-progress = 10%
    const progress = (completedStages * 20) + (inProgressStages * 10);
    return Math.min(progress, 100);
  };

  // Hàm tính completion dựa trên timeline
  const calculateCompletionFromTimeline = (timeline: Array<{ stage: string; date: string; status: "completed" | "in-progress" | "upcoming" }>): number => {
    const totalStages = timeline.length;
    const completedStages = timeline.filter(stage => stage.status === "completed").length;
    return totalStages > 0 ? Math.floor((completedStages / totalStages) * 100) : 0;
  };

  const mapFundingStageToUI = (stage: string): string => {
    const stageMap: { [key: string]: string } = {
      'SEED': 'Initial Review',
    };
    return stageMap[stage] || 'Initial Review';
  };

  const formatCurrency = (amount: number): string => {
    if (amount === 0) return '$0';
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  const generateTimeline = (project: ApiProject): Array<{ stage: string; date: string; status: "completed" | "in-progress" | "upcoming" }> => {
    const stages = ['Initial Review', 'Investor Meetings', 'Due Diligence', 'Term Sheet', 'Final Agreement'];
    const currentStage = mapFundingStageToUI(project.fundingStage);
    
    const baseDate = project.createdAt ? new Date(project.createdAt) : new Date();

    return stages.map((stage, index) => {
      let status: "completed" | "in-progress" | "upcoming" = "upcoming";
      let date: string = "";

      if (index === 0 && project.createdAt) {
        date = baseDate.toISOString().split('T')[0];
      }

      // Xử lý trạng thái DRAFT và PUBLISHED cho Initial Review
      if (stage === 'Initial Review') {
        if (project.status === 'DRAFT') {
          status = 'in-progress';
        } else if (project.status === 'PUBLISHED') {
          status = 'completed';
        }
      } else {
        const currentStageIndex = stages.indexOf(currentStage);
        if (index < currentStageIndex) {
          status = "completed";
        } else if (index === currentStageIndex) {
          status = project.status === 'APPROVED' ? "completed" : "in-progress";
        } else if (index > currentStageIndex) {
          status = "upcoming";
        }
      }

      return {
        stage,
        date: (status === "completed" || status === "in-progress") ? date : "",
        status
      };
    });
  };

  // Lấy milestones cho project cụ thể
  const getProjectMilestones = (projectId: number): Array<{label: string; due: string; checked: boolean}> => {
    if (!apiMilestones || !Array.isArray(apiMilestones)) return [];
    
    const projectMilestones = apiMilestones.filter((milestone: any) => 
      milestone.projectId === projectId
    );

    return projectMilestones.map((milestone: any) => ({
      label: milestone.title || "Milestone",
      due: milestone.dueDate || new Date().toISOString().split('T')[0],
      checked: milestone.status === 'COMPLETED' || milestone.isCompleted || false
    }));
  };

  // State cho projects hiển thị
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Các useEffect
  useEffect(() => {
    dispatch(getMyProjects() as any);
  }, [dispatch]);

  useEffect(() => {
    if (apiProjects && apiProjects.length > 0 && !selectedProject) {
      setSelectedProject(apiProjects[0].id);
    }
  }, [apiProjects, selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(getMilestonesByProject(selectedProject) as any);
    }
  }, [selectedProject, dispatch]);

  useEffect(() => {
    if (apiProjects && apiProjects.length > 0) {
      const transformedProjects = transformApiProjectsToUI(apiProjects);
      setProjects(transformedProjects);
    } else {
      setProjects([]);
      setSelectedProject(null);
    }
  }, [apiProjects, apiMilestones]);

  // Debug dữ liệu API
  useEffect(() => {
    console.log('API Projects:', apiProjects);
    console.log('Transformed Projects:', projects);
  }, [apiProjects, projects]);

  const handleCheckboxChange = async (index: number) => {
    if (!selectedProject) return;

    const selectedProjectData = projects.find(project => project.id === selectedProject);
    if (!selectedProjectData) return;

    const milestone = selectedProjectData.milestones[index];
    
    try {
      const projectMilestones = apiMilestones?.filter((milestone: any) => 
        milestone.projectId === selectedProject
      ) || [];

      if (projectMilestones[index]) {
        const apiMilestone = projectMilestones[index];
        
        await dispatch(updateMilestone({
          id: apiMilestone.id,
          data: { 
            status: milestone.checked ? 'PENDING' : 'COMPLETED'
          }
        }) as any);
        
        dispatch(getMilestonesByProject(selectedProject) as any);
        message.success('Milestone updated successfully');
      }
    } catch (error) {
      message.error('Failed to update milestone');
      console.error('Failed to update milestone:', error);
    }
  };

  const handleNewProject = () => {
    navigate("/startup/new-project");
  };

  const handleDeleteProject = async (projectId: number) => {
    setDeletingProjectIds(prev => [...prev, projectId]);
    setDeleteError(null);
    try {
      await dispatch(deleteProject(projectId) as any);
      message.success('Project deleted successfully');
      if (selectedProject === projectId) {
        setSelectedProject(apiProjects.length > 1 ? apiProjects.find(p => p.id !== projectId)?.id || null : null);
      }
    } catch (error: any) {
      setDeleteError(error.payload || 'Failed to delete project');
      message.error(error.payload || 'Failed to delete project');
    } finally {
      setDeletingProjectIds(prev => prev.filter(id => id !== projectId));
    }
  };

  const selectedProjectData = projects.find(project => project.id === selectedProject);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED": return { background: "#dcfce7", color: "#16a34a" };
      case "DRAFT": return { background: "#fef3c7", color: "#92400e" };
      case "PUBLISHED": return { background: "#dbeafe", color: "#1e40af" };
      case "REJECTED": return { background: "#fee2e2", color: "#ef4444" };
      default: return { background: "#e5e7eb", color: "#6b7280" };
    }
  };

  const getTimelineDotStyle = (status: "completed" | "in-progress" | "upcoming") => {
    switch (status) {
      case "completed": return { background: "#3b82f6" };
      case "in-progress": return { background: "#fff", border: "2px solid #3b82f6" };
      case "upcoming": return { background: "#fff", border: "2px solid #64748b" };
      default: return { background: "#fff", border: "2px solid #64748b" };
    }
  };

  const getTimelineTextStyle = (status: "completed" | "in-progress" | "upcoming") => {
    switch (status) {
      case "completed": return { color: "#3b82f6" };
      case "in-progress": return { color: "#3b82f6" };
      case "upcoming": return { color: "#64748b" };
      default: return { color: "#64748b" };
    }
  };

  if (status === "loading" && projects.length === 0) {
    return (
      <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div>Loading projects...</div>
      </div>
    );
  }

  if (status === "failed" && projects.length === 0) {
    return (
      <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
        <div style={{ color: "red", textAlign: "center" }}>
          Error loading projects: {error}
        </div>
      </div>
    );
  }

  if (projects.length === 0 && status === "succeeded") {
    return (
      <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <h3>No projects found</h3>
          <p>Create your first project to get started</p>
          <button
            onClick={handleNewProject}
            style={{
              padding: "10px 20px",
              background: "#38bdf8",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Create New Project
          </button>
        </div>
      </div>
    );
  }

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

      {deleteError && (
        <div style={{ color: "red", textAlign: "center", marginBottom: 16 }}>
          {deleteError}
        </div>
      )}

      {/* Top - Project Cards */}
      <div style={{ 
        display: "flex", 
        gap: 16, 
        marginBottom: 24, 
        overflowX: "auto",
        paddingBottom: 8
      }}>
        {projects.map((project) => {
          const statusStyle = getStatusColor(project.status);
          const isDeleting = deletingProjectIds.includes(project.id);
          // SỬ DỤNG getStatusText MỚI ĐỂ HIỂN THỊ STATUS
          const displayStatus = getStatusText(project.status);
          
          return (
            <div 
              key={project.id}
              onClick={() => !isDeleting && setSelectedProject(project.id)}
              style={{ 
                flex: "0 0 300px",
                minWidth: 300,
                background: "#fff", 
                borderRadius: 12, 
                padding: 16, 
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: selectedProject === project.id ? "2px solid #3b82f6" : "2px solid transparent",
                cursor: isDeleting ? "not-allowed" : "pointer",
                opacity: isDeleting ? 0.6 : 1,
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{project.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ 
                    fontSize: 12, 
                    background: statusStyle.background, 
                    color: statusStyle.color, 
                    padding: "2px 8px", 
                    borderRadius: 999 
                  }}>
                    {/* HIỂN THỊ STATUS TEXT MỚI */}
                    {displayStatus}
                  </span>
                  <Popconfirm
                    title="Are you sure you want to delete this project?"
                    onConfirm={() => handleDeleteProject(project.id)}
                    okText="Yes"
                    cancelText="No"
                    disabled={isDeleting}
                  >
                    <DeleteOutlined 
                      style={{ 
                        color: isDeleting ? "#d1d5db" : "#ef4444", 
                        cursor: isDeleting ? "not-allowed" : "pointer" 
                      }} 
                    />
                  </Popconfirm>
                </div>
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
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Target: {project.target}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Stage: {project.stage}</p>
            </div>
          );
        })}
      </div>

      {selectedProjectData && (
        <>
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
                    <span style={{ float: "right", fontSize: 12 }}>
                      {item.date || "Not started"}
                    </span>
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyProjects;