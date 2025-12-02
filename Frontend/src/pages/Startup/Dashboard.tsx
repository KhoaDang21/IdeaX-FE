import type { FC } from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "antd";
import type { RootState, AppDispatch } from "../../store";
import {
  getMyProjects,
  getMilestonesByProject,
} from "../../services/features/project/projectSlice";
// ✅ Import thêm action fetchMeetings để lấy dữ liệu meeting/hợp đồng
import { fetchMeetings } from "../../services/features/meeting/meetingSlice";

import type { Project as ApiProject } from "../../interfaces/project";
import type { Milestone as ApiMilestone } from "../../interfaces/milestone";
import type {
  DashboardStats,
  Activity,
  ProjectMilestone,
} from "../../interfaces/startup/dashboard";

import { DashboardStatsGrid } from "../../components/startup/dashboard/DashboardStatsGrid";
import { FundingTrendsChart } from "../../components/startup/dashboard/FundingTrendsChart";
import { ProjectsByStageChart } from "../../components/startup/dashboard/ProjectsByStageChart";
import { ProjectMilestonesList } from "../../components/startup/dashboard/ProjectMilestonesList";
import { RecentActivityList } from "../../components/startup/dashboard/RecentActivityList";
import { AllActivitiesModal } from "../../components/startup/dashboard/AllActivitiesModal";

const initialStats: DashboardStats = {
  totalProjects: 0,
  fundingRaised: 0,
  interestedInvestors: 0,
  avgInvestorEngagement: 0,
  growthRate: 0,
};

const StartupDashboard: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects: apiProjects, milestones: apiMilestones } = useSelector(
    (state: RootState) => state.project
  );
  // ✅ Lấy state meeting từ Redux
  const { meetings } = useSelector((state: RootState) => state.meeting);

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [displayMilestones, setDisplayMilestones] = useState<
    ProjectMilestone[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [fundingStageData, setFundingStageData] = useState<any[]>([]);

  // ✅ Đổi state này để chứa dữ liệu so sánh Target vs Raised
  const [fundingProgressData, setFundingProgressData] = useState<any[]>([]);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  const formatCurrency = (amount: number): string => {
    if (amount === 0) return "$0";
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`; // Tỷ
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`; // Triệu
    return `${amount.toLocaleString()}`;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatFundingStage = (stage: string): string => {
    const stageMap: { [key: string]: string } = {
      IDEA: "Idea",
      SEED: "Seed",
      SERIES_A: "Series A",
      SERIES_B: "Series B",
      SERIES_C: "Series C",
      IPO: "IPO",
    };
    return stageMap[stage] || stage;
  };

  const fundingStageColors = {
    IDEA: "#8b5cf6",
    SEED: "#3b82f6",
    SERIES_A: "#10b981",
    SERIES_B: "#f59e0b",
    SERIES_C: "#ef4444",
    IPO: "#6b7280",
  };

  // ✅ CẬP NHẬT LOGIC TÍNH TOÁN STATS
  const calculateStats = (
    projects: ApiProject[],
    meetingList: any[]
  ): DashboardStats => {
    const totalProjects = projects.length;

    // 1. Funding Raised: Tổng tiền thực nhận (fundingReceived)
    const fundingRaised = projects.reduce(
      (sum, p) => sum + ((p as any).fundingReceived || 0), // cast any để tránh lỗi TS nếu thiếu type
      0
    );

    // 2. Interested Investors (Avg. per Project cũ): Số người tạo Meeting Rooms
    // Sử dụng Set để đếm unique investor ID
    const uniqueMeetingInvestors = new Set(
      meetingList.map((m) => m.createdById)
    ).size;

    // 3. Investor Engagement: Số người đã KÝ HỢP ĐỒNG (FULLY_SIGNED)
    const uniqueSignedInvestors = new Set(
      meetingList
        .filter((m) => m.contractStatus === "FULLY_SIGNED")
        .map((m) => m.createdById)
    ).size;

    // Growth rate (giả lập hoặc tính dựa trên funding recent)
    const growthRate = totalProjects > 0 ? 12 : 0;

    return {
      totalProjects,
      fundingRaised,
      interestedInvestors: uniqueSignedInvestors, // Hiển thị ở ô Investor Engagement
      avgInvestorEngagement: uniqueMeetingInvestors, // Hiển thị ở ô Avg. Per Project (đổi tên sau)
      growthRate,
    };
  };

  const calculateDisplayData = (
    projects: ApiProject[],
    milestonesData: ApiMilestone[]
  ) => {
    // 1. Projects by Stage Chart
    const stageCount: { [key: string]: number } = {};
    Object.keys(fundingStageColors).forEach((stage) => {
      stageCount[stage] = 0;
    });
    projects.forEach((project) => {
      const stage = project.fundingStage || "IDEA";
      stageCount[stage] = (stageCount[stage] || 0) + 1;
    });
    const totalProjectsCount = projects.length;
    const stageData = Object.entries(stageCount).map(([stage, count]) => ({
      stage: formatFundingStage(stage),
      count,
      percent:
        totalProjectsCount > 0
          ? Math.round((count / totalProjectsCount) * 100)
          : 0,
      color:
        fundingStageColors[stage as keyof typeof fundingStageColors] ||
        "#6b7280",
    }));
    setFundingStageData(stageData);

    // ✅ 2. Funding Progress Chart (Thay thế Monthly Trends)
    // So sánh Target (fundingAmount) và Raised (fundingReceived) của các dự án
    const progressData = projects.map((p) => ({
      name: p.projectName,
      Goal: p.fundingAmount || 0,
      Raised: (p as any).fundingReceived || 0,
    }));
    setFundingProgressData(progressData);

    // 3. Map Milestones
    const relevantMilestones = [...milestonesData];
    relevantMilestones.sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );

    const mappedMilestones: ProjectMilestone[] = relevantMilestones
      .slice(0, 4)
      .map((m) => {
        const project = projects.find((p) => p.id === m.projectId);
        let status: "completed" | "in-progress" | "upcoming" = "upcoming";
        let progress = 0;

        switch (m.status?.toUpperCase()) {
          case "COMPLETED":
            status = "completed";
            progress = 100;
            break;
          case "IN_PROGRESS":
            status = "in-progress";
            progress = 50;
            break;
          case "PENDING":
          default:
            status = "upcoming";
            progress = 0;
            break;
        }
        if (project?.status === "COMPLETE" && status !== "completed") {
          status = "completed";
          progress = 100;
        }

        return {
          id: m.id,
          project: project?.projectName || `Project #${m.projectId}`,
          milestone: m.title || "Untitled Milestone",
          dueDate: m.dueDate
            ? new Date(m.dueDate).toISOString().split("T")[0]
            : "N/A",
          status,
          progress,
        };
      });
    setDisplayMilestones(mappedMilestones);

    // 4. Map Activities
    const storedActivities = JSON.parse(
      localStorage.getItem("recentActivities") || "[]"
    ) as Array<{ action: string; projectId?: string; timestamp: number }>;

    const mappedActivities: Activity[] = storedActivities.map(
      (activity, index) => {
        const projectAct = projects.find(
          (p) => String(p.id) === activity.projectId
        );
        const actionLower = activity.action.toLowerCase();

        const getIcon = (action: string) => {
          if (action.includes("created new project")) return "user-add";
          if (action.includes("created new milestone")) return "check";
          if (action.includes("deleted project")) return "delete";
          if (action.includes("deleted milestone")) return "delete";
          return "file";
        };

        const getStatus = (
          projectStatus: string | undefined
        ): "completed" | "in-progress" | "pending" => {
          if (projectStatus === "COMPLETE") return "completed";
          if (projectStatus === "DRAFT") return "pending";
          return "in-progress";
        };

        return {
          id: activity.timestamp || index,
          type: actionLower.includes("project")
            ? "PROJECT"
            : actionLower.includes("milestone")
            ? "MILESTONE"
            : "GENERAL",
          title: activity.action,
          project:
            projectAct?.projectName ||
            (activity.projectId ? `Project #${activity.projectId}` : "General"),
          timestamp: formatTimeAgo(new Date(activity.timestamp)),
          icon: getIcon(actionLower),
          status: getStatus(projectAct?.status),
        };
      }
    );
    setAllActivities(mappedActivities);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const projectAction = await dispatch(getMyProjects());
        // ✅ Fetch luôn meetings
        await dispatch(fetchMeetings());

        if (
          getMyProjects.fulfilled.match(projectAction) &&
          projectAction.payload.length > 0
        ) {
          const milestonePromises = projectAction.payload.map((project) =>
            dispatch(getMilestonesByProject(project.id))
          );
          await Promise.all(milestonePromises);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [dispatch]);

  useEffect(() => {
    if (apiProjects) {
      calculateDisplayData(apiProjects, apiMilestones || []);
      if (apiProjects.length > 0) {
        // ✅ Truyền meetings vào hàm tính stats
        setStats(calculateStats(apiProjects, meetings || []));
      } else {
        setStats(initialStats);
      }
    }
  }, [apiProjects, apiMilestones, meetings]); // ✅ Thêm dependencies meetings

  const handleViewAllActivities = () => {
    setIsActivityModalVisible(true);
  };
  const handleCloseActivityModal = () => {
    setIsActivityModalVisible(false);
  };

  if (loading) {
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
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{ fontSize: 28, fontWeight: 700, color: "#1f2937", margin: 0 }}
        >
          Startup Dashboard
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", margin: "4px 0 0" }}>
          Welcome back! Here's your business overview
        </p>
      </div>

      <DashboardStatsGrid stats={stats} formatCurrency={formatCurrency} />

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              {/* ✅ Sử dụng biểu đồ mới */}
              <FundingTrendsChart
                stats={stats}
                data={fundingProgressData} // Data mới
                formatCurrency={formatCurrency}
              />
            </Col>
            <Col xs={24}>
              <ProjectsByStageChart
                stats={stats}
                fundingStageData={fundingStageData}
                fundingColumnConfig={{}} // Config mặc định
              />
            </Col>
          </Row>
        </Col>

        <Col xs={24} xl={8}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <ProjectMilestonesList milestones={displayMilestones} />
            </Col>
            <Col xs={24}>
              <RecentActivityList
                activities={allActivities}
                onViewAll={handleViewAllActivities}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <AllActivitiesModal
        visible={isActivityModalVisible}
        activities={allActivities}
        onClose={handleCloseActivityModal}
      />
    </div>
  );
};

export default StartupDashboard;
