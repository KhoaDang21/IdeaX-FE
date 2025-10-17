import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChartOutlined,
  MessageOutlined,
  UploadOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Popconfirm, message, Modal, Form, Input, DatePicker, Button, Tooltip } from "antd";
import type { RootState } from "../../store";
import { getMyProjects, getMilestonesByProject, deleteProject, createMilestone } from "../../services/features/project/projectSlice";
import type { Project as ApiProject } from "../../interfaces/project";
import type { Milestone as ApiMilestone } from "../../interfaces/milestone";

// Interface cho UI đã được dọn dẹp
interface MilestoneUI {
  label: string;
  due: string;
  description: string;
}

interface ProjectUI {
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
  milestones: MilestoneUI[];
  metrics: {
    activeInvestors: number;
    completedMilestones: number;
    totalMilestones: number;
    completion: number;
  };
}

// CÁC HÀM HELPERS ĐƯA RA NGOÀI COMPONENT ĐỂ TĂNG HIỆU NĂNG
const formatCurrency = (amount: number): string => {
  if (amount === 0) return '$0';
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount}`;
};

const getFundingRangeDisplay = (fundingRange: string): string => {
  const rangeMap: { [key: string]: string } = {
    'UNDER_50K': 'UNDER $50K',
    'FROM_50K_TO_200K': '$50K - $200K',
    'FROM_200K_TO_1M': '$200K - $1M',
    'OVER_1M': 'Over $1M'
  };
  return rangeMap[fundingRange] || 'Not specified';
};

const getStatusText = (status: string): string => {
  switch (status.toUpperCase()) {
    case "APPROVED": return "In Deal";
    case "DRAFT": return "Pending Review";
    case "PUBLISHED": return "Active";
    case "REJECTED": return "Rejected";
    case "COMPLETE": return "Completed";
    default: return status;
  }
};

const generateTimeline = (project: ApiProject): ProjectUI['timeline'] => {
  const stages = ['Initial Review', 'Contract Signing', 'Funding Completion'];
  return stages.map((stage) => {
    let status: "completed" | "in-progress" | "upcoming" = "upcoming";
    let date = "";
    if (stage === 'Initial Review' && project.createdAt) {
      date = new Date(project.createdAt).toISOString().split('T')[0];
    }
    switch (project.status) {
      case 'DRAFT':
        if (stage === 'Initial Review') status = 'in-progress';
        break;
      case 'PUBLISHED':
        if (stage === 'Initial Review') status = 'completed';
        else if (stage === 'Contract Signing') status = 'in-progress';
        break;
      case 'APPROVED':
        if (['Initial Review', 'Contract Signing'].includes(stage)) status = 'completed';
        else if (stage === 'Funding Completion') status = 'in-progress';
        break;
      case 'COMPLETE':
        status = 'completed';
        break;
    }
    if (status === "completed" && !date) {
      date = new Date().toISOString().split('T')[0];
    }
    return { stage, date, status };
  });
};

const calculateProgressFromTimeline = (timeline: ProjectUI['timeline']): number => {
  const completedStages = timeline.filter(s => s.status === "completed").length;
  const inProgressStages = timeline.filter(s => s.status === "in-progress").length;
  const progress = (completedStages * 33.33) + (inProgressStages * 16.67);
  return Math.min(Math.round(progress), 100);
};

const calculateCompletionFromTimeline = (timeline: ProjectUI['timeline']): number => {
  const totalStages = timeline.length;
  const completedStages = timeline.filter(s => s.status === "completed").length;
  return totalStages > 0 ? Math.floor((completedStages / totalStages) * 100) : 0;
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "APPROVED": return { background: "#dcfce7", color: "#16a34a" };
    case "DRAFT": return { background: "#fef3c7", color: "#92400e" };
    case "PUBLISHED": return { background: "#dbeafe", color: "#1e40af" };
    case "REJECTED": return { background: "#fee2e2", color: "#ef4444" };
    case "COMPLETE": return { background: "#e0f2fe", color: "#0284c7" };
    default: return { background: "#e5e7eb", color: "#6b7280" };
  }
};

const getTimelineDotStyle = (status: "completed" | "in-progress" | "upcoming") => {
  switch (status) {
    case "completed": return { background: "#3b82f6" };
    case "in-progress": return { background: "#fff", border: "2px solid #3b82f6" };
    default: return { background: "#fff", border: "2px solid #64748b" };
  }
};

const getTimelineTextStyle = (status: "completed" | "in-progress" | "upcoming") => {
  switch (status) {
    case "completed":
    case "in-progress": return { color: "#3b82f6" };
    default: return { color: "#64748b" };
  }
};


const MyProjects: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [deletingProjectIds, setDeletingProjectIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  const { projects: apiProjects, milestones: apiMilestones, status, error } = useSelector((state: RootState) => state.project);

  // TỐI ƯU 1: Dùng useMemo để tránh tính toán lại toàn bộ danh sách projects không cần thiết
  const projects = useMemo((): ProjectUI[] => {
    if (!apiProjects || apiProjects.length === 0) return [];
    return apiProjects.map(project => {
      const timeline = generateTimeline(project);
      const completion = calculateCompletionFromTimeline(timeline);
      const progress = calculateProgressFromTimeline(timeline);
      
      let stageName = "Initial Review";
      const order: Record<string, number> = { "Initial Review": 0, "Contract Signing": 1, "Funding Completion": 2 };
      const sortedTimeline = [...timeline].sort((a, b) => order[a.stage] - order[b.stage]);
      
      let stageStatus: ProjectUI['timeline'][0]['status'] = "upcoming";
      for (const item of sortedTimeline) {
        if (item.status === "completed" || item.status === "in-progress") {
          stageName = item.stage;
          stageStatus = item.status;
        }
      }

      let stage = stageName;
      if (stageStatus === 'in-progress') {
        stage += ' (Currently in progress)';
      }
      const lastStage = sortedTimeline[sortedTimeline.length - 1];
      if (lastStage?.status === 'completed') {
        stage = `${lastStage.stage} (Completed)`;
      }

      return {
        id: project.id,
        title: project.projectName || "Untitled Project",
        status: project.status || "Unknown",
        progress,
        raised: formatCurrency(project.fundingAmount || 0),
        target: getFundingRangeDisplay(project.fundingRange),
        stage,
        timeline,
        milestones: [], // Sẽ được thêm vào sau trong selectedProjectData
        metrics: {
          activeInvestors: project.investorClicks || 0,
          completedMilestones: 0, // Tạm thời để 0
          totalMilestones: 0, // Tạm thời để 0
          completion,
        }
      };
    });
  }, [apiProjects]);

  // TỐI ƯU 2: Dùng useMemo để lấy dữ liệu project được chọn và kết hợp với milestones
  const selectedProjectData = useMemo(() => {
    const project = projects.find(p => p.id === selectedProject);
    if (!project) return null;

    // SỬA LỖI 1: Ánh xạ milestones trực tiếp, không filter
    const projectMilestones: MilestoneUI[] = (apiMilestones || []).map((milestone: ApiMilestone) => ({
      label: milestone.title || "Milestone",
      due: milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : "N/A",
      description: milestone.description || ''
    }));

    // Cập nhật lại metrics
    const completedMilestones = (apiMilestones || []).filter(m => m.status === 'COMPLETED').length;
    const totalMilestones = projectMilestones.length;

    return {
      ...project,
      milestones: projectMilestones,
      metrics: {
        ...project.metrics,
        completedMilestones,
        totalMilestones,
      }
    };
  }, [projects, selectedProject, apiMilestones]);

  // Effect để fetch danh sách projects
  useEffect(() => {
    dispatch(getMyProjects() as any);
  }, [dispatch]);

  // Effect để tự động chọn project đầu tiên
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Effect để fetch milestones khi project được chọn
  useEffect(() => {
    if (selectedProject) {
      dispatch(getMilestonesByProject(selectedProject) as any);
    }
  }, [selectedProject, dispatch]);


  const handleNewProject = () => {
    navigate("/startup/new-project");
  };

  const handleDeleteProject = async (projectId: number) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;
    const allowedStatuses = ["DRAFT", "REJECTED"];
    if (allowedStatuses.includes(projectToDelete.status.toUpperCase())) {
      setDeletingProjectIds(prev => [...prev, projectId]);
      try {
        await dispatch(deleteProject(projectId) as any);
        message.success('Project deleted successfully');
        if (selectedProject === projectId) {
          setSelectedProject(projects.length > 1 ? projects.find(p => p.id !== projectId)?.id ?? null : null);
        }
      } catch (err: any) {
        message.error(err.payload || 'Failed to delete project');
      } finally {
        setDeletingProjectIds(prev => prev.filter(id => id !== projectId));
      }
    } else {
      message.warning('Dự án ở trạng thái này không thể xóa. Vui lòng liên hệ quản trị viên.');
    }
  };

  const handleOk = async () => {
    if (!selectedProject) return;
    try {
      const values = await form.validateFields();
      const data = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        status: 'PENDING'
      };
      await dispatch(createMilestone({ projectId: selectedProject, data }) as any);
      dispatch(getMilestonesByProject(selectedProject) as any);
      message.success('Milestone created successfully');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create milestone');
    }
  };

  if (status === "loading" && projects.length === 0) {
    return <div style={{ padding: 24, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading projects...</div>;
  }

  if (status === "failed" && projects.length === 0) {
    return <div style={{ padding: 24, minHeight: "100vh" }}><div style={{ color: "red", textAlign: "center" }}>Error: {error}</div></div>;
  }

  if (projects.length === 0 && status === "succeeded") {
    return (
      <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <h3>No projects found</h3>
          <p>Create your first project to get started</p>
          <Button type="primary" size="large" onClick={handleNewProject} style={{background: "#38bdf8"}}>Create New Project</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 6 }}>
        <div>
          <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: 16, fontWeight: 600 }}>Project Status</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Track your project progress and manage milestones</p>
        </div>
        <Button type="primary" onClick={handleNewProject} style={{background: "#38bdf8"}}>New Project</Button>
      </div>

      {/* Top - Project Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
        {projects.map((project) => {
          const statusStyle = getStatusColor(project.status);
          const isDeleting = deletingProjectIds.includes(project.id);
          const isDeletionDisallowed = !['DRAFT', 'REJECTED'].includes(project.status.toUpperCase());
          
          return (
            <div key={project.id} onClick={() => !isDeleting && setSelectedProject(project.id)} style={{ flex: "0 0 300px", minWidth: 300, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: selectedProject === project.id ? "2px solid #3b82f6" : "2px solid transparent", cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.6 : 1, transition: "all 0.2s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{project.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, background: statusStyle.background, color: statusStyle.color, padding: "2px 8px", borderRadius: 999 }}>{getStatusText(project.status)}</span>
                  {isDeletionDisallowed ? (
                    <Tooltip title="Liên hệ quản lí để xóa"><span><DeleteOutlined style={{ color: "#d1d5db", cursor: "not-allowed" }}/></span></Tooltip>
                  ) : (
                    <Popconfirm title="Are you sure you want to delete this project?" onConfirm={() => handleDeleteProject(project.id)} okText="Yes" cancelText="No" disabled={isDeleting}>
                      <DeleteOutlined style={{ color: isDeleting ? "#d1d5db" : "#ef4444", cursor: isDeleting ? "not-allowed" : "pointer" }}/>
                    </Popconfirm>
                  )}
                </div>
              </div>
              <p style={{ margin: "8px 0", fontSize: 12, color: "#64748b" }}>Progress {project.progress}%</p>
              <div style={{ height: 6, background: "#e5e7eb", borderRadius: 999 }}><div style={{ width: `${project.progress}%`, height: "100%", background: "#3b82f6", borderRadius: 999 }} /></div>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Target: {project.target}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Stage: {project.stage}</p>
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Project Timeline</h3>
                <h3 style={{ margin: 0, fontSize: 16 }}>{selectedProjectData.title}</h3>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, position: "relative", paddingLeft: 30 }}>
                {selectedProjectData.timeline.map((item, index) => (
                  <li key={index} style={{ marginBottom: 16, position: "relative" }}>
                    <span style={{ position: "absolute", left: -24, top: 2, width: 16, height: 16, borderRadius: "50%", ...getTimelineDotStyle(item.status) }}></span>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                      <span style={getTimelineTextStyle(item.status)}>{item.stage}</span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{item.date || "Pending"}</span>
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

            {/* Milestones */}
            <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Milestones</h3>
                <Button type="primary" size="small" onClick={() => setIsModalOpen(true)} style={{ background: "#3b82f6" }}>Add Milestone</Button>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
                {selectedProjectData.milestones.length > 0 ? selectedProjectData.milestones.map((milestone, index) => (
                  <li key={index} style={{ marginBottom: 12 }}>
                    <span style={{ fontWeight: 500 }}>{milestone.label}</span>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Due: {milestone.due}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{milestone.description}</div>
                  </li>
                )) : <li>No milestones yet.</li>}
              </ul>
            </div>
          </div>

          <Modal title={<h3 style={{ color: "#1e3a8a", margin: 0 }}>Create New Milestone</h3>} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)} footer={[<Button key="cancel" onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>, <Button key="submit" type="primary" onClick={handleOk} style={{ background: "#3b82f6", borderColor: "#3b82f6" }}>Add Milestone</Button>]} style={{ top: 20 }} width={400}>
            <Form form={form} layout="vertical">
              <Form.Item name="title" label={<span style={{ fontWeight: 500, color: "#374151" }}>Title</span>} rules={[{ required: true, message: 'Please input the title!' }]} style={{ marginBottom: 16 }}>
                <Input placeholder="Enter milestone title" style={{ borderRadius: 6, padding: "6px 12px" }} />
              </Form.Item>
              <Form.Item name="description" label={<span style={{ fontWeight: 500, color: "#374151" }}>Description</span>} style={{ marginBottom: 16 }}>
                <Input.TextArea placeholder="Enter milestone description" autoSize={{ minRows: 3, maxRows: 5 }} style={{ borderRadius: 6, padding: "6px 12px" }} />
              </Form.Item>
              <Form.Item name="dueDate" label={<span style={{ fontWeight: 500, color: "#374151" }}>Due Date</span>} rules={[{ required: true, message: 'Please select the due date!' }]}>
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%', borderRadius: 6, padding: "6px 12px" }} placeholder="Select due date"/>
              </Form.Item>
            </Form>
          </Modal>

          {/* Metrics & Quick Actions */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 2, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Project Metrics</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <h2 style={{ margin: 0, color: "#3b82f6" }}>{selectedProjectData.metrics.activeInvestors}</h2>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Active Investors</p>
                </div>
                <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <h2 style={{ margin: 0, color: "#3b82f6" }}>{selectedProjectData.metrics.completedMilestones}/{selectedProjectData.metrics.totalMilestones}</h2>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Milestones</p>
                </div>
                <div style={{ flex: 1, minWidth: 150, background: "#eff6ff", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <h2 style={{ margin: 0, color: "#3b82f6" }}>{selectedProjectData.metrics.completion}%</h2>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Completion</p>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Button icon={<BarChartOutlined style={{ color: "#16a34a" }} />} style={{textAlign: 'left'}}>View Analytics</Button>
                <Button icon={<MessageOutlined style={{ color: "#3b82f6" }} />} style={{textAlign: 'left'}}>Message Investors</Button>
                <Button icon={<UploadOutlined style={{ color: "#64748b" }} />} style={{textAlign: 'left'}}>Upload Documents</Button>
                <Button icon={<PlusCircleOutlined style={{ color: "red" }} />} style={{textAlign: 'left'}}>Set Goals</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyProjects;