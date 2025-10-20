import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FundOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  UserAddOutlined,
  FileOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { RootState } from '../../store';
import { getMyProjects } from '../../services/features/project/projectSlice';
import type { Project as ApiProject } from '../../interfaces/project';

// Interfaces cho dashboard data
interface DashboardStats {
  totalProjects: number;
  fundingRaised: number;
  interestedInvestors: number;
}

interface RecentMessage {
  id: number;
  sender: string;
  company: string;
  message: string;
  timestamp: string;
  unread: boolean;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  project: string;
  timestamp: string;
  icon: string;
}

const StartupDashboard: FC = () => {
  const dispatch = useDispatch();
  const { projects: apiProjects } = useSelector((state: RootState) => state.project);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    fundingRaised: 0,
    interestedInvestors: 0,
  });
  
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm tính toán stats từ projects thực tế - GIỐNG MyProjects
  const calculateStats = (projects: ApiProject[]): DashboardStats => {
    const totalProjects = projects.length;
    const fundingRaised = projects.reduce((sum, project) => sum + (project.fundingAmount || 0), 0);
    const interestedInvestors = projects.reduce((sum, project) => sum + (project.investorClicks || 0), 0);

    return {
      totalProjects,
      fundingRaised,
      interestedInvestors,
    };
  };

  // Hàm format currency - GIỐNG MyProjects
  const formatCurrency = (amount: number): string => {
    if (amount === 0) return '$0';
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  // Hàm hiển thị fundingRange từ API - GIỐNG MyProjects
  const getFundingRangeDisplay = (fundingRange: string): string => {
    const rangeMap: { [key: string]: string } = {
      'UNDER_50K': 'UNDER $50K',
      'FROM_50K_TO_200K': '$50K - $200K',
      'FROM_200K_TO_1M': '$200K - $1M',
      'OVER_1M': 'Over $1M'
    };
    return rangeMap[fundingRange] || 'Not specified';
  };

  // Hàm generate timeline - GIỐNG MyProjects
  const generateTimeline = (project: ApiProject): Array<{ stage: string; date: string; status: "completed" | "in-progress" | "upcoming" }> => {
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

  // Hàm tính progress - GIỐNG MyProjects (17%, 50%, 83%, 100%)
  const calculateProgressFromTimeline = (timeline: Array<{ stage: string; date: string; status: "completed" | "in-progress" | "upcoming" }>): number => {
    const completedStages = timeline.filter(s => s.status === "completed").length;
    const inProgressStages = timeline.filter(s => s.status === "in-progress").length;
    const progress = (completedStages * 33.33) + (inProgressStages * 16.67);
    return Math.min(Math.round(progress), 100);
  };

  // Hàm lấy stage name với trạng thái - GIỐNG MyProjects
  const getStageName = (project: ApiProject): string => {
    const timeline = generateTimeline(project);
    const order: Record<string, number> = { "Initial Review": 0, "Contract Signing": 1, "Funding Completion": 2 };
    const sortedTimeline = [...timeline].sort((a, b) => order[a.stage] - order[b.stage]);
    
    let stageName = "Initial Review";
    let stageStatus: "completed" | "in-progress" | "upcoming" = "upcoming";
    
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

    return stage;
  };

  // Hàm get status color - GIỐNG MyProjects
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

  // Hàm get status text - GIỐNG MyProjects
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

  // API call để lấy messages thực tế
  const fetchRecentMessages = async (): Promise<RecentMessage[]> => {
    try {
      // Thay bằng API endpoint thực tế của bạn
      const response = await fetch('/api/messages/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.messages.map((msg: any) => ({
          id: msg.id,
          sender: msg.senderName,
          company: msg.company || '',
          message: msg.content,
          timestamp: formatTimeAgo(new Date(msg.createdAt)),
          unread: !msg.isRead
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  // API call để lấy activities thực tế từ user behavior
  const fetchRecentActivities = async (): Promise<Activity[]> => {
    try {
      // Thay bằng API endpoint thực tế của bạn
      const response = await fetch('/api/activities/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.activities.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          title: getActivityTitle(activity.type),
          project: activity.projectName || 'General',
          timestamp: formatTimeAgo(new Date(activity.createdAt)),
          icon: getActivityIcon(activity.type)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  };

  // Hàm format thời gian (giống như trong MyProjects)
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Map activity type to title
  const getActivityTitle = (type: string): string => {
    const titleMap: { [key: string]: string } = {
      'PROJECT_CREATED': 'Project Created',
      'PROJECT_UPDATED': 'Project Updated',
      'INVESTOR_VIEW': 'Investor Viewed Project',
      'MILESTONE_COMPLETED': 'Milestone Completed',
      'DOCUMENT_UPDATED': 'Document Updated',
      'MEETING_SCHEDULED': 'Meeting Scheduled',
      'FUNDING_UPDATE': 'Funding Status Updated'
    };
    return titleMap[type] || 'Activity';
  };

  // Map activity type to icon
  const getActivityIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      'PROJECT_CREATED': 'user-add',
      'PROJECT_UPDATED': 'file',
      'INVESTOR_VIEW': 'team',
      'MILESTONE_COMPLETED': 'check',
      'DOCUMENT_UPDATED': 'file',
      'MEETING_SCHEDULED': 'calendar',
      'FUNDING_UPDATE': 'dollar'
    };
    return iconMap[type] || 'file';
  };

  // Load data khi component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load projects từ Redux (đã có trong MyProjects)
        await dispatch(getMyProjects() as any);
        
        // Load messages và activities song song
        const [messages, activitiesData] = await Promise.all([
          fetchRecentMessages(),
          fetchRecentActivities()
        ]);
        
        setRecentMessages(messages);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  // Update stats khi apiProjects thay đổi
  useEffect(() => {
    if (apiProjects && apiProjects.length > 0) {
      const calculatedStats = calculateStats(apiProjects);
      setStats(calculatedStats);
    }
  }, [apiProjects]);

  // Render icon cho activity
  const renderActivityIcon = (icon: string) => {
    const iconProps = { style: { fontSize: 20, color: '#000' } };
    
    switch (icon) {
      case 'user-add':
        return <UserAddOutlined {...iconProps} />;
      case 'team':
        return <TeamOutlined {...iconProps} />;
      case 'file':
        return <FileOutlined {...iconProps} />;
      case 'calendar':
        return <CalendarOutlined {...iconProps} />;
      case 'dollar':
        return <DollarCircleOutlined {...iconProps} />;
      default:
        return <FileOutlined {...iconProps} />;
    }
  };

  // Background color cho activity icon
  const getActivityIconBg = (icon: string) => {
    switch (icon) {
      case 'user-add': return '#dcfce7';
      case 'team': return '#eff6ff';
      case 'file': return '#fefce8';
      case 'calendar': return '#f5f3ff';
      case 'dollar': return '#f0fdf4';
      default: return '#e5e7eb';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, background: '#f9fafb', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f9fafb', minHeight: '100vh' }}>
      {/* Stats Section với data thực tế - CHỈ CÒN 3 STATS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, minWidth: 250, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FundOutlined style={{ fontSize: 24, color: '#000' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>Total Projects</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>{stats.totalProjects}</h2>
          </div>
        </div>
        
        <div style={{ flex: 1, minWidth: 250, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarCircleOutlined style={{ fontSize: 24, color: '#000' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>Funding Raised</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>{formatCurrency(stats.fundingRaised)}</h2>
          </div>
        </div>
        
        <div style={{ flex: 1, minWidth: 250, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TeamOutlined style={{ fontSize: 24, color: '#000' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>Interested Investors</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>{stats.interestedInvestors}</h2>
          </div>
        </div>
      </div>

      {/* Main Content - 2 columns layout */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Left Column - Projects với data thực tế và status GIỐNG MyProjects */}
        <div style={{ flex: 2, minWidth: 400 }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: 0 }}>Your Projects</h3>
              <a href="/startup/my-projects" style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none' }}>View All</a>
            </div>

            {apiProjects && apiProjects.slice(0, 3).map((project) => {
              const timeline = generateTimeline(project);
              const progress = calculateProgressFromTimeline(timeline);
              const stage = getStageName(project);
              const statusStyle = getStatusColor(project.status || '');
              const statusText = getStatusText(project.status || '');
              
              return (
                <div key={project.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                        {project.projectName || 'Untitled Project'}
                      </h4>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                        {project.category} • {project.fundingStage} • {formatTimeAgo(new Date(project.createdAt))}
                      </p>
                    </div>
                    <span style={{ 
                      fontSize: 12, 
                      padding: '2px 8px', 
                      background: statusStyle.background, 
                      color: statusStyle.color, 
                      borderRadius: 999 
                    }}>
                      {statusText}
                    </span>
                  </div>
                  
                  {/* CHỈ HIỂN THỊ TARGET, KHÔNG HIỂN THỊ RAISED/TARGET */}
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: '12px 0 0' }}>
                    Target: {getFundingRangeDisplay(project.fundingRange || '')}
                  </p>
                  
                  <div style={{ width: '100%', background: '#e5e7eb', height: 8, borderRadius: 999, margin: '8px 0' }}>
                    <div style={{ background: '#3b82f6', height: 8, borderRadius: 999, width: `${progress}%` }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      Stage: <span style={{ fontWeight: 500 }}>{stage}</span>
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{progress}%</p>
                    <button 
                      onClick={() => window.location.href = `/startup/projects/${project.id}`}
                      style={{ color: '#3b82f6', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      View Details
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0' }}>
                    {project.investorClicks || 0} investors
                  </p>
                </div>
              );
            })}

            {(!apiProjects || apiProjects.length === 0) && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: '#64748b', margin: 0 }}>No projects found</p>
                <a href="/startup/new-project" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                  Create your first project
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Messages và Activity với data thực tế */}
        <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Messages Section với data thực tế */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>Recent Messages</h3>
            
            {recentMessages.length > 0 ? recentMessages.slice(0, 3).map((message) => (
              <div key={message.id} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>
                    {message.sender}
                    {message.unread && (
                      <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: 999, display: 'inline-block', marginLeft: 4 }}></span>
                    )}
                  </p>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{message.timestamp}</span>
                </div>
                {message.company && (
                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>{message.company}</p>
                )}
                <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>
                  {message.message}
                </p>
              </div>
            )) : (
              <p style={{ color: '#64748b', textAlign: 'center', margin: 0 }}>No recent messages</p>
            )}
            
            <a href="/messages" style={{ display: 'block', color: '#3b82f6', fontSize: 14, marginTop: 12, fontWeight: 500, textDecoration: 'none' }}>
              View All Messages
            </a>
          </div>

          {/* Activity Section với data thực tế */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>Recent Activity</h3>
            
            {activities.length > 0 ? activities.slice(0, 3).map((activity) => (
              <div key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ flexShrink: 0, borderRadius: 999, background: getActivityIconBg(activity.icon), padding: 8 }}>
                  {renderActivityIcon(activity.icon)}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>{activity.title}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>{activity.project}</p>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 4 }}>{activity.timestamp}</span>
                </div>
              </div>
            )) : (
              <p style={{ color: '#64748b', textAlign: 'center', margin: 0 }}>No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDashboard;