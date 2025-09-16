import type { FC } from 'react';
import {
  FundOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  MessageOutlined,
  UserAddOutlined,
  FileOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const StartupDashboard: FC = () => {
  return (
    <div style={{ padding: 24, background: '#f9fafb', minHeight: '100vh' }}>
      {/* Stats Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, minWidth: 250, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FundOutlined style={{ fontSize: 24, color: '#000' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>Total Projects</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>3</h2>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 250, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarCircleOutlined style={{ fontSize: 24, color: '#000' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>Funding Raised</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>$750K</h2>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 250, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TeamOutlined style={{ fontSize: 24, color: '#000' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>Interested Investors</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>6</h2>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 250, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageOutlined style={{ fontSize: 24, color: '#000' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>Active Rooms</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>3</h2>
          </div>
        </div>
      </div>

      {/* Main Content - 2 columns layout */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Left Column - Projects (2/3 width) */}
        <div style={{ flex: 2, minWidth: 400 }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: 0 }}>Your Projects</h3>
              <a href="#" style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none' }}>View All</a>
            </div>

            {/* Project 1 */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>AI-Powered Analytics Platform</h4>
                  <p style={{ fontSize: 14, color: '#475569', margin: '4px 0 0' }}>
                    Revolutionary analytics platform using machine learning to provide real-time business insights
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>AI/ML - Series A • 2 hours ago</p>
                </div>
                <span style={{ fontSize: 12, padding: '2px 8px', background: '#dcfce7', color: '#16a34a', borderRadius: 999 }}>In Deal</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: '12px 0 0' }}>$500K / $1M</p>
              <div style={{ width: '100%', background: '#e5e7eb', height: 8, borderRadius: 999, margin: '8px 0' }}>
                <div style={{ background: '#3b82f6', height: 8, borderRadius: 999, width: '75%' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                  Deal Stage: <span style={{ fontWeight: 500 }}>Due Diligence</span>
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>75%</p>
                <button style={{ color: '#3b82f6', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>View Details</button>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0' }}>3 investors</p>
            </div>

            {/* Project 2 */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>Green Energy Solutions</h4>
                  <p style={{ fontSize: 14, color: '#475569', margin: '4px 0 0' }}>
                    Sustainable energy solutions for urban environments using solar and wind integration
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>CleanTech - Seed • 1 day ago</p>
                </div>
                <span style={{ fontSize: 12, padding: '2px 8px', background: '#fefce8', color: '#d97706', borderRadius: 999 }}>Pending Review</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: '12px 0 0' }}>$0 / $750K</p>
              <div style={{ width: '100%', background: '#e5e7eb', height: 8, borderRadius: 999, margin: '8px 0' }}>
                <div style={{ background: '#3b82f6', height: 8, borderRadius: 999, width: '30%' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                  Deal Stage: <span style={{ fontWeight: 500 }}>Initial Review</span>
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>30%</p>
                <button style={{ color: '#3b82f6', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>View Details</button>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0' }}>1 investor</p>
            </div>

            {/* Project 3 */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>HealthTech Mobile App</h4>
                  <p style={{ fontSize: 14, color: '#475569', margin: '4px 0 0' }}>
                    Mobile health monitoring app with AI-driven diagnostics and telemedicine features
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>HealthTech - Pre-Series A • 3 hours ago</p>
                </div>
                <span style={{ fontSize: 12, padding: '2px 8px', background: '#dbeafe', color: '#2563eb', borderRadius: 999 }}>Active</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: '12px 0 0' }}>$250K / $500K</p>
              <div style={{ width: '100%', background: '#e5e7eb', height: 8, borderRadius: 999, margin: '8px 0' }}>
                <div style={{ background: '#3b82f6', height: 8, borderRadius: 999, width: '60%' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                  Deal Stage: <span style={{ fontWeight: 500 }}>Investor Meetings</span>
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>60%</p>
                <button style={{ color: '#3b82f6', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>View Details</button>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0' }}>2 investors</p>
            </div>
          </div>
        </div>

        {/* Right Column - Messages and Activity (1/3 width) */}
        <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Messages Section */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>Recent Messages</h3>
            
            {/* Message 1 */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>Sarah Wilson <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: 999, display: 'inline-block', marginLeft: 4 }}></span></p>
                <span style={{ fontSize: 12, color: '#64748b' }}>2 hours ago</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>TechVentures</p>
              <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>
                Interested in our AI platform. Can we schedule a call?
              </p>
            </div>
            
            {/* Message 2 */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>Admin Team</p>
                <span style={{ fontSize: 12, color: '#64748b' }}>1 day ago</span>
              </div>
              <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>
                Your Green Energy project has been approved for listing
              </p>
            </div>
            
            {/* Message 3 */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>Michael Chen <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: 999, display: 'inline-block', marginLeft: 4 }}></span></p>
                <span style={{ fontSize: 12, color: '#64748b' }}>3 hours ago</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>GreenFund</p>
              <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>
                Would like to discuss investment terms for your HealthTech app
              </p>
            </div>
            
            <a href="#" style={{ display: 'block', color: '#3b82f6', fontSize: 14, marginTop: 12, fontWeight: 500, textDecoration: 'none' }}>
              View All Messages
            </a>
          </div>

          {/* Activity Section */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>Recent Activity</h3>
            
            {/* Activity 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ flexShrink: 0, borderRadius: 999, background: '#dcfce7', padding: 8 }}>
                <UserAddOutlined style={{ fontSize: 20, color: '#000' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>New Investor Interest</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>AI-Powered Analytics Platform</p>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 4 }}>2 hours ago</span>
              </div>
            </div>
            
            {/* Activity 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ flexShrink: 0, borderRadius: 999, background: '#fefce8', padding: 8 }}>
                <FileOutlined style={{ fontSize: 20, color: '#000' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>Document uploaded</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>Green Energy Solutions</p>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 4 }}>1 day ago</span>
              </div>
            </div>
            
            {/* Activity 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flexShrink: 0, borderRadius: 999, background: '#eff6ff', padding: 8 }}>
                <CalendarOutlined style={{ fontSize: 20, color: '#000' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>Meeting scheduled</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>HealthTech Mobile App</p>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 4 }}>3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDashboard;