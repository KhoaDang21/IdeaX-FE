import React, { useState } from "react";
import { SearchOutlined, DownloadOutlined, RightOutlined } from "@ant-design/icons";

const Roommeet: React.FC = () => {
  const [agreeToNDA, setAgreeToNDA] = useState(false);

  // Dữ liệu mẫu
  const pendingRequests = [
    { projectName: "AI-Powered Analytics Platform", investorName: "Sarah Wilson", status: "Approved", action: "View Room" },
    { projectName: "Green Energy Solutions", investorName: "Michael Chen", status: "Waiting", action: "Cancel" },
    { projectName: "HealthTech Mobile App", investorName: "Emma Rodriguez", status: "Rejected", action: "View Details" },
    { projectName: "EduTech Learning Platform", investorName: "David Park", status: "Waiting", action: "Cancel" },
  ];

  const dealHandoffStatus = [
    { roomId: "RM+2024-001", linkedProject: "AI-Powered Analytics Platform", status: "Delivered", lastUpdated: "Feb 15, 2024", action: "View Transfer Notes" },
    { roomId: "RM+2024-002", linkedProject: "HealthTech Mobile App", status: "In Progress", lastUpdated: "Feb 18, 2024", action: "Mark as Delivered" },
    { roomId: "RM+2024-003", linkedProject: "Green Energy Solutions", status: "In Progress", lastUpdated: "Feb 20, 2024", action: "Mark as Delivered" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return { background: "#dcfce7", color: "#16a34a" };
      case "Waiting": return { background: "#fefce8", color: "#d97706" };
      case "Rejected": return { background: "#fee2e2", color: "#dc2626" };
      case "Delivered": return { background: "#dcfce7", color: "#16a34a" };
      case "In Progress": return { background: "#eff6ff", color: "#3b82f6" };
      default: return { background: "#e5e7eb", color: "#6b7280" };
    }
  };

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 600, color: "#1e3a8a" }}>
          Roommeet & NDA
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
          Manage investor meetings and non-disclosure agreements
        </p>
      </div>

      <div style={{ display: "flex", gap: 24, flexDirection: "column" }}>
        {/* Hai phần đầu tiên nằm ngang */}
<div style={{ display: "flex", gap: 24 }}>
  {/* Request New Room Section */}
  <div style={{ 
    flex: 1,
    background: "#fff", 
    borderRadius: 12, 
    padding: 20, 
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb"
  }}>
    <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 600 }}>
      Request New Room
    </h2>
    <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b7280" }}>
      Create a new meeting room with an investor for your project discussions
    </p>
    <button style={{
      width: "100%",
      padding: "10px 0",
      background: "#3b82f6",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 18,
      fontWeight: 600,
      marginTop: 40,
    }}>
      + Create Room Request
    </button>
  </div>

  {/* NDA Confirmation & Room Access */}
  <div style={{ 
    flex: 1,
    background: "#fff", 
    borderRadius: 12, 
    padding: 20, 
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb"
  }}>
    <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>
      NDA Confirmation & Room Access
    </h2>
    
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 500 }}>
        AI-Powered Analytics Platform
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
        Room with Sarah Wilson - Venture Capital Partners
      </p>
    </div>

    {/* Download NDA link */}
    <div style={{ marginBottom: 16 }}>
      <a href="#" style={{ 
        display: "flex", 
        alignItems: "center", 
        fontSize: 14, 
        color: "#3b82f6", 
        textDecoration: "none", 
        gap: 6 
      }}>
        <DownloadOutlined style={{ fontSize: 16 }} /> Download NDA Document
      </a>
    </div>

    {/* Checkbox */}
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <input
        type="checkbox"
        id="nda-agreement"
        checked={agreeToNDA}
        onChange={(e) => setAgreeToNDA(e.target.checked)}
        style={{ width: 16, height: 16 }}
      />
      <label htmlFor="nda-agreement" style={{ fontSize: 14, color: "#374151" }}>
        I agree to the NDA terms and conditions
      </label>
    </div>

    {/* Enter Roommeet button */}
    <button 
      disabled={!agreeToNDA}
      style={{
        width: "100%",
        padding: "12px 0",
        background: agreeToNDA ? "#3b82f6" : "#d1d5db",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: agreeToNDA ? "pointer" : "not-allowed",
        fontSize: 15,
        fontWeight: 600,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8
      }}
    >
      Enter Roommeet <RightOutlined />
    </button>

    <div style={{ marginTop: 12, padding: 12, background: "#f9fafb", borderRadius: 6 }}>
      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>
        Last message: "Looking forward to discussing the technical architecture..."
      </p>
    </div>
  </div>
</div>


        {/* Pending Room Requests */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 12, 
          padding: 20, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid #e5e7eb"
        }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>
            Pending Room Requests
          </h2>
          
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Project Name</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Investor Name</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request, index) => {
                  const statusStyle = getStatusColor(request.status);
                  return (
                    <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 8px", fontSize: 14 }}>{request.projectName}</td>
                      <td style={{ padding: "12px 8px", fontSize: 14 }}>{request.investorName}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{
                          fontSize: 12,
                          background: statusStyle.background,
                          color: statusStyle.color,
                          padding: "4px 8px",
                          borderRadius: 999,
                          fontWeight: 500
                        }}>
                          {request.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <button style={{
                          padding: "4px 8px",
                          background: "transparent",
                          color: request.action === "Cancel" ? "#ef4444" : "#3b82f6",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 14
                        }}>
                          {request.action}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deal Handoff Status */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 12, 
          padding: 20, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid #e5e7eb"
        }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>
            Deal Handoff Status
          </h2>
          
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Room ID</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Linked Project</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Last Updated</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dealHandoffStatus.map((deal, index) => {
                  const statusStyle = getStatusColor(deal.status);
                  return (
                    <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 8px", fontSize: 14, fontWeight: 500 }}>{deal.roomId}</td>
                      <td style={{ padding: "12px 8px", fontSize: 14 }}>{deal.linkedProject}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{
                          fontSize: 12,
                          background: statusStyle.background,
                          color: statusStyle.color,
                          padding: "4px 8px",
                          borderRadius: 999,
                          fontWeight: 500
                        }}>
                          {deal.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: 14, color: "#6b7280" }}>{deal.lastUpdated}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <button style={{
                          padding: "4px 8px",
                          background: "transparent",
                          color: "#3b82f6",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 14
                        }}>
                          {deal.action}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roommeet;