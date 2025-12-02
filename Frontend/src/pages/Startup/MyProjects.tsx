import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { message, Form, Button } from "antd";
import type { RootState, AppDispatch } from "../../store";
import {
  getMyProjects,
  getMilestonesByProject,
  deleteProject,
  createMilestone,
  deleteMilestone,
} from "../../services/features/project/projectSlice";
import type { Project as ApiProject } from "../../interfaces/project";
import type { Milestone as ApiMilestone } from "../../interfaces/milestone";
import { logActivity } from "../../utils/activityLogger";
import type {
  ProjectUI,
  MilestoneUI,
} from "../../interfaces/startup/myprojects";

// Import components
import { ProjectPageHeader } from "../../components/startup/myprojects/ProjectPageHeader";
import { ProjectCarousel } from "../../components/startup/myprojects/ProjectCarousel";
import { ProjectTimeline } from "../../components/startup/myprojects/ProjectTimeline";
import { MilestoneList } from "../../components/startup/myprojects/MilestoneList";
import { ProjectMetrics } from "../../components/startup/myprojects/ProjectMetrics";
import { QuickActions } from "../../components/startup/myprojects/QuickActions";
import { AddMilestoneModal } from "../../components/startup/myprojects/AddMilestoneModal";
import { UpgradeModal } from "../../components/startup/myprojects/UpgradeModal";

// --- Helpers ---
const formatCurrency = (amount: number): string => {
  if (amount === 0) return "$0";
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount}`;
};

const getFundingRangeDisplay = (fundingRange: string): string => {
  const rangeMap: { [key: string]: string } = {
    UNDER_50K: "UNDER $50K",
    FROM_50K_TO_200K: "$50K - $200K",
    FROM_200K_TO_1M: "$200K - $1M",
    OVER_1M: "Over $1M",
  };
  return rangeMap[fundingRange] || "Not specified";
};

const generateTimeline = (project: ApiProject): ProjectUI["timeline"] => {
  const stages = ["Initial Review", "Contract Signing", "Funding Completion"];
  return stages.map((stage) => {
    let status: "completed" | "in-progress" | "upcoming" = "upcoming";
    let date = "";
    if (stage === "Initial Review" && project.createdAt) {
      date = new Date(project.createdAt).toISOString().split("T")[0];
    }
    switch (project.status) {
      case "DRAFT":
        if (stage === "Initial Review") status = "in-progress";
        break;
      case "PUBLISHED":
        if (stage === "Initial Review") status = "completed";
        else if (stage === "Contract Signing") status = "in-progress";
        break;
      case "APPROVED":
        if (["Initial Review", "Contract Signing"].includes(stage))
          status = "completed";
        else if (stage === "Funding Completion") status = "in-progress";
        break;
      case "COMPLETE":
        status = "completed";
        break;
    }
    if (status === "completed" && !date) {
      date = new Date().toISOString().split("T")[0];
    }
    return { stage, date, status };
  });
};

const calculateProgressFromTimeline = (
  timeline: ProjectUI["timeline"]
): number => {
  const completedStages = timeline.filter(
    (s) => s.status === "completed"
  ).length;
  const inProgressStages = timeline.filter(
    (s) => s.status === "in-progress"
  ).length;
  const progress = completedStages * 33.33 + inProgressStages * 16.67;
  return Math.min(Math.round(progress), 100);
};

const calculateCompletionFromTimeline = (
  timeline: ProjectUI["timeline"]
): number => {
  const totalStages = timeline.length;
  const completedStages = timeline.filter(
    (s) => s.status === "completed"
  ).length;
  return totalStages > 0
    ? Math.floor((completedStages / totalStages) * 100)
    : 0;
};
// --- End Helpers ---

const MyProjects: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [deletingProjectIds, setDeletingProjectIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // State cho Upgrade Modal
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const {
    projects: apiProjects,
    milestones: apiMilestones,
    status,
    error,
  } = useSelector((state: RootState) => state.project);

  const { user } = useSelector((state: RootState) => state.auth);

  // --- TÍNH TOÁN GIỚI HẠN DỰ ÁN ---
  const currentProjectCount = apiProjects?.length || 0;
  // Mặc định là 0 hoặc lấy từ user nếu đã load xong
  const projectLimit = user?.projectLimit || 0;

  // Tính toán danh sách projects UI
  const projects = useMemo((): ProjectUI[] => {
    if (!apiProjects || apiProjects.length === 0) return [];
    return apiProjects.map((project) => {
      const timeline = generateTimeline(project);
      const completion = calculateCompletionFromTimeline(timeline);
      const progress = calculateProgressFromTimeline(timeline);

      let stageName = "Initial Review";
      const order: Record<string, number> = {
        "Initial Review": 0,
        "Contract Signing": 1,
        "Funding Completion": 2,
      };
      const sortedTimeline = [...timeline].sort(
        (a, b) => order[a.stage] - order[b.stage]
      );

      let stageStatus: ProjectUI["timeline"][0]["status"] = "upcoming";
      for (const item of sortedTimeline) {
        if (item.status === "completed" || item.status === "in-progress") {
          stageName = item.stage;
          stageStatus = item.status;
        }
      }

      let stage = stageName;
      if (stageStatus === "in-progress") {
        stage += " (Currently in progress)";
      }
      const lastStage = sortedTimeline[sortedTimeline.length - 1];
      if (lastStage?.status === "completed") {
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
        milestones: [],
        metrics: {
          activeInvestors: project.investorClicks || 0,
          completedMilestones: 0,
          totalMilestones: 0,
          completion,
        },
      };
    });
  }, [apiProjects]);

  const selectedProjectData = useMemo(() => {
    const project = projects.find((p) => p.id === selectedProject);
    if (!project) return null;

    const projectMilestones: MilestoneUI[] = (apiMilestones || []).map(
      (milestone: ApiMilestone) => ({
        id: milestone.id,
        label: milestone.title || "Milestone",
        due: milestone.dueDate
          ? new Date(milestone.dueDate).toISOString().split("T")[0]
          : "N/A",
        description: milestone.description || "",
      })
    );

    const completedMilestones = (apiMilestones || []).filter(
      (m) => m.status === "COMPLETED"
    ).length;
    const totalMilestones = projectMilestones.length;

    return {
      ...project,
      milestones: projectMilestones,
      metrics: {
        ...project.metrics,
        completedMilestones,
        totalMilestones,
      },
    };
  }, [projects, selectedProject, apiMilestones]);

  useEffect(() => {
    dispatch(getMyProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(getMilestonesByProject(selectedProject));
    }
  }, [selectedProject, dispatch]);

  // --- Handlers ---

  const handleNewProject = () => {
    if (currentProjectCount >= projectLimit) {
      message.warning("You have reached your project limit. Please upgrade!");
      setIsUpgradeModalOpen(true);
    } else {
      navigate("/startup/new-project");
    }
  };

  const handleBuyMore = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleDeleteProject = async (projectId: number) => {
    const projectToDelete = projects.find((p) => p.id === projectId);
    if (!projectToDelete) return;
    const allowedStatuses = ["DRAFT", "REJECTED"];
    if (allowedStatuses.includes(projectToDelete.status.toUpperCase())) {
      setDeletingProjectIds((prev) => [...prev, projectId]);
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        logActivity({
          action: `Deleted project: ${projectToDelete.title}`,
          timestamp: Date.now(),
        });
        message.success("Project deleted successfully");
        dispatch(getMyProjects());
        if (selectedProject === projectId) {
          const remainingProjects = projects.filter((p) => p.id !== projectId);
          setSelectedProject(
            remainingProjects.length > 0 ? remainingProjects[0].id : null
          );
        }
      } catch (err: any) {
        message.error(err || "Failed to delete project");
      } finally {
        setDeletingProjectIds((prev) => prev.filter((id) => id !== projectId));
      }
    } else {
      message.warning(
        "Projects in this status cannot be deleted. Please contact support."
      );
    }
  };

  const handleDeleteMilestone = async (milestoneId: number) => {
    if (!selectedProject) return;
    const milestoneToDelete = apiMilestones?.find((m) => m.id === milestoneId);
    const currentProject = projects.find((p) => p.id === selectedProject);

    message.loading({
      content: "Deleting milestone...",
      key: "deleteMilestone",
    });
    try {
      await dispatch(deleteMilestone(milestoneId)).unwrap();
      logActivity({
        action: `Deleted milestone: ${
          milestoneToDelete?.title || "Milestone"
        } from project: ${currentProject?.title || "Unknown"}`,
        projectId: String(selectedProject),
        timestamp: Date.now(),
      });
      message.success({ content: "Milestone deleted", key: "deleteMilestone" });
      dispatch(getMilestonesByProject(selectedProject));
    } catch (err: any) {
      message.error({
        content: err || "Failed to delete milestone",
        key: "deleteMilestone",
      });
    }
  };

  const handleCreateMilestone = async () => {
    if (!selectedProject) return;
    try {
      const values = await form.validateFields();
      const data = {
        projectId: selectedProject,
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
        status: "PENDING",
      };
      const result = await dispatch(
        createMilestone({ projectId: selectedProject, data })
      ).unwrap();
      logActivity({
        action: `Created new milestone: ${result.title || "Milestone"}`,
        projectId: String(selectedProject),
        timestamp: Date.now(),
      });
      dispatch(getMilestonesByProject(selectedProject));
      message.success("Milestone created successfully");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error || "Failed to create milestone");
    }
  };

  const handleViewDetails = (projectId: number) => {
    navigate(`/startup/projects/${projectId}`);
  };

  // --- Render ---

  if (status === "loading" && projects.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading projects...
      </div>
    );
  }

  if (status === "failed" && projects.length === 0) {
    return (
      <div style={{ padding: 24, minHeight: "100vh" }}>
        <div style={{ color: "red", textAlign: "center" }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      {/* Luôn hiển thị Header để thấy thông tin Limit và nút Buy */}
      <ProjectPageHeader
        onNewProject={handleNewProject}
        onBuyMore={handleBuyMore}
        currentCount={currentProjectCount}
        maxLimit={projectLimit}
      />

      {projects.length === 0 && status === "succeeded" ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <h3>No projects found</h3>
          <p>Create your first project to get started</p>
          <Button
            type="primary"
            size="large"
            onClick={handleNewProject}
            style={{ background: "#38bdf8" }}
          >
            Create New Project
          </Button>
        </div>
      ) : (
        <>
          <ProjectCarousel
            projects={projects}
            selectedProject={selectedProject}
            deletingProjectIds={deletingProjectIds}
            onSelectProject={setSelectedProject}
            onDeleteProject={handleDeleteProject}
            onViewDetails={handleViewDetails}
          />

          {selectedProjectData && (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  marginBottom: 24,
                }}
              >
                <ProjectTimeline
                  title={selectedProjectData.title}
                  timeline={selectedProjectData.timeline}
                />
                <MilestoneList
                  milestones={selectedProjectData.milestones}
                  onAddMilestone={() => setIsModalOpen(true)}
                  onDeleteMilestone={handleDeleteMilestone}
                />
              </div>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <ProjectMetrics metrics={selectedProjectData.metrics} />
                <QuickActions />
              </div>
            </>
          )}
        </>
      )}

      <AddMilestoneModal
        isOpen={isModalOpen}
        onOk={handleCreateMilestone}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        form={form}
      />

      <UpgradeModal
        open={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
};

export default MyProjects;
