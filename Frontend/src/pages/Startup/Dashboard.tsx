import type { FC } from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "antd";
import type { RootState, AppDispatch } from "../../store";
// Import thêm getMilestonesByProject và kiểu Milestone
import {
  getMyProjects,
  getMilestonesByProject,
} from "../../services/features/project/projectSlice";
import type { Project as ApiProject } from "../../interfaces/project";
import type { Milestone as ApiMilestone } from "../../interfaces/milestone"; // <-- Import kiểu Milestone
import type {
  DashboardStats,
  Activity,
  ProjectMilestone,
} from "../../interfaces/startup/dashboard";

// Import child components
import { DashboardStatsGrid } from "../../components/startup/dashboard/DashboardStatsGrid";
import { FundingTrendsChart } from "../../components/startup/dashboard/FundingTrendsChart";
import { ProjectsByStageChart } from "../../components/startup/dashboard/ProjectsByStageChart";
import { ProjectMilestonesList } from "../../components/startup/dashboard/ProjectMilestonesList";
import { RecentActivityList } from "../../components/startup/dashboard/RecentActivityList";
import { AllActivitiesModal } from "../../components/startup/dashboard/AllActivitiesModal";

// Define a proper initial state for DashboardStats
const initialStats: DashboardStats = {
  totalProjects: 0,
  fundingRaised: 0,
  interestedInvestors: 0,
  avgInvestorEngagement: 0,
  growthRate: 0,
};

const StartupDashboard: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Lấy cả projects và milestones từ Redux state
  const { projects: apiProjects, milestones: apiMilestones } = useSelector(
    (state: RootState) => state.project
  );

  // --- Component States ---
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  // State này lưu trữ milestones đã map cho UI
  const [displayMilestones, setDisplayMilestones] = useState<
    ProjectMilestone[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("6m");
  const [fundingStageData, setFundingStageData] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  // --- Helper Functions ---
  const formatCurrency = (amount: number): string => {
    if (amount === 0) return "$0";
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount}`;
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

  const calculateStats = (projects: ApiProject[]): DashboardStats => {
    const totalProjects = projects.length;
    const fundingRaised = projects.reduce(
      (sum, p) => sum + (p.fundingAmount || 0),
      0
    );
    const interestedInvestors = projects.reduce(
      (sum, p) => sum + (p.investorClicks || 0),
      0
    );
    const avgInvestorEngagement =
      totalProjects > 0 ? Math.round(interestedInvestors / totalProjects) : 0;
    const growthRate =
      totalProjects > 0
        ? Math.round(interestedInvestors / totalProjects / 10)
        : 0; // Simple example
    return {
      totalProjects,
      fundingRaised,
      interestedInvestors,
      avgInvestorEngagement,
      growthRate,
    };
  };

  // --- Data Calculation Logic ---
  // Hàm này giờ tính toán chart data, map activities, VÀ map milestones
  const calculateDisplayData = (
    projects: ApiProject[],
    milestonesData: ApiMilestone[]
  ) => {
    // Calculate Funding Stage Distribution
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

    // Calculate Monthly Trends
    const monthlyData: {
      [key: string]: { projects: number; investors: number; funding: number };
    } = {};
    const currentYear = new Date().getFullYear();
    projects.forEach((project) => {
      if (
        !project.createdAt ||
        new Date(project.createdAt).getFullYear() !== currentYear
      )
        return;
      const date = new Date(project.createdAt);
      const monthKey = date
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase();
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { projects: 0, investors: 0, funding: 0 };
      }
      monthlyData[monthKey].projects += 1;
      monthlyData[monthKey].investors += project.investorClicks || 0;
      monthlyData[monthKey].funding += project.fundingAmount || 0;
    });
    const monthOrder = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const trendsData = monthOrder
      .map((month) => ({
        month,
        projects: monthlyData[month]?.projects || 0,
        investors: monthlyData[month]?.investors || 0,
        funding: monthlyData[month]?.funding || 0,
      }))
      .filter(
        (item) => item.projects > 0 || item.investors > 0 || item.funding > 0
      );
    setMonthlyTrends(trendsData);

    // --- MAP MILESTONES THỰC TẾ (Lấy từ apiMilestones từ Redux) ---
    // Chỉ lấy milestones thuộc project đầu tiên (do hạn chế của slice hiện tại)
    const relevantMilestones = [...milestonesData];
    // Bạn có thể thêm logic sắp xếp ở đây, ví dụ: sắp xếp theo ngày gần nhất
    relevantMilestones.sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );

    const mappedMilestones: ProjectMilestone[] = relevantMilestones
      .slice(0, 4) // Giới hạn hiển thị 4 milestones trên dashboard
      .map((m) => {
        const project = projects.find((p) => p.id === m.projectId); // Tìm project tương ứng
        let status: "completed" | "in-progress" | "upcoming" = "upcoming";
        let progress = 0;

        // Map trạng thái từ API sang trạng thái UI
        switch (m.status?.toUpperCase()) {
          case "COMPLETED":
            status = "completed";
            progress = 100;
            break;
          case "IN_PROGRESS": // Giả sử có trạng thái này
            status = "in-progress";
            progress = 50; // Hoặc logic khác
            break;
          case "PENDING":
          default:
            status = "upcoming";
            progress = 0;
            break;
        }
        // Ghi đè thành completed nếu project đã completed
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
    setDisplayMilestones(mappedMilestones); // Cập nhật state displayMilestones

    // Load and Map Activities from localStorage
    const storedActivities = JSON.parse(
      localStorage.getItem("recentActivities") || "[]"
    ) as Array<{ action: string; projectId?: string; timestamp: number }>;

    const mappedActivities: Activity[] = storedActivities.map(
      (activity, index) => {
        const projectAct = projects.find(
          // Đổi tên biến để tránh trùng lặp
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

  // --- Effects ---
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const projectAction = await dispatch(getMyProjects());
        // Chỉ fetch milestones nếu lấy projects thành công VÀ có project
        if (
          getMyProjects.fulfilled.match(projectAction) &&
          projectAction.payload.length > 0
        ) {
          // Tạo một mảng các lời hứa (Promise) để fetch milestones cho TẤT CẢ project
          const milestonePromises = projectAction.payload.map((project) =>
            dispatch(getMilestonesByProject(project.id))
          );
          // Chờ tất cả các lời hứa hoàn thành
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

  // Effect này chạy khi projects HOẶC milestones từ Redux thay đổi
  useEffect(() => {
    // Chỉ tính toán lại khi apiProjects đã được load (không phải null/undefined)
    if (apiProjects) {
      // Truyền apiMilestones (có thể là [] nếu chưa load xong hoặc không có)
      calculateDisplayData(apiProjects, apiMilestones || []);
      // Tính stats dựa trên apiProjects
      if (apiProjects.length > 0) {
        setStats(calculateStats(apiProjects));
      } else {
        setStats(initialStats); // Reset stats nếu không có project
      }
    }
  }, [apiProjects, apiMilestones]); // Phụ thuộc vào cả hai

  // --- Modal Handlers ---
  const handleViewAllActivities = () => {
    setIsActivityModalVisible(true);
  };
  const handleCloseActivityModal = () => {
    setIsActivityModalVisible(false);
  };

  // --- Chart Configurations ---
  const areaChartConfig = {
    data: monthlyTrends,
    xField: "month",
    yField: "funding",
    smooth: true,
    height: 120,
    padding: "auto",
    areaStyle: () => ({ fill: "l(270) 0:#ffffff 0.5:#764ba2 1:#667eea" }),
    line: { color: "#667eea" },
    tooltip: {
      formatter: (datum: any) => ({
        name: "Funding",
        value: formatCurrency(datum.funding),
      }),
    },
    xAxis: { line: null, tickLine: null, label: { style: { fill: "#aaa" } } },
    yAxis: { grid: null, label: null },
  };

  const fundingColumnConfig = {
    data: fundingStageData,
    xField: "stage",
    yField: "count",
    colorField: "stage",
    color: ({ stage }: any) => {
      const stageKey = Object.keys(fundingStageColors).find(
        (key) => formatFundingStage(key) === stage
      );
      return stageKey
        ? fundingStageColors[stageKey as keyof typeof fundingStageColors]
        : "#6b7280";
    },
    legend: false,
    height: 350,
    padding: "auto",
    columnStyle: { radius: [4, 4, 0, 0] },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.stage,
        value: `${datum.count} projects`,
      }),
    },
    xAxis: {
      label: { autoHide: true, autoRotate: false, style: { fontSize: 11 } },
      title: { text: "Funding Stage", style: { fontSize: 12 } },
    },
    yAxis: {
      title: { text: "Number of Projects", style: { fontSize: 12 } },
      grid: { line: { style: { stroke: "#eee" } } },
    },
  };

  // --- Render Logic ---
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
      {/* Header Section */}
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

      {/* Stats Grid Component */}
      <DashboardStatsGrid stats={stats} formatCurrency={formatCurrency} />

      {/* Main Content Area */}
      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} xl={16}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <FundingTrendsChart
                stats={stats}
                monthlyTrends={monthlyTrends}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                areaChartConfig={areaChartConfig}
                formatCurrency={formatCurrency}
              />
            </Col>
            <Col xs={24}>
              <ProjectsByStageChart
                stats={stats}
                fundingStageData={fundingStageData}
                fundingColumnConfig={fundingColumnConfig}
              />
            </Col>
          </Row>
        </Col>

        {/* Right Column */}
        <Col xs={24} xl={8}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              {/* Truyền displayMilestones đã được map từ state */}
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

      {/* Modal for All Activities */}
      <AllActivitiesModal
        visible={isActivityModalVisible}
        activities={allActivities}
        onClose={handleCloseActivityModal}
      />
    </div>
  );
};

export default StartupDashboard;
