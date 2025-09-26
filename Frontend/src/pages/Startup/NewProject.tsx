import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadOutlined,
  VideoCameraOutlined,
  FileOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  UsergroupAddOutlined,
  DollarCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const SubmitNewProject: React.FC = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [fundingStage, setFundingStage] = useState("");
  const [fundingTarget, setFundingTarget] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [useOfFunds, setUseOfFunds] = useState("");
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [pitchVideo, setPitchVideo] = useState<File | null>(null);
  const [businessPlan, setBusinessPlan] = useState<File | null>(null);
  const [financialProjections, setFinancialProjections] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleBackToProjects = () => {
    navigate("/startup/my-projects"); // Điều hướng đến route "my-projects"
  };

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: "#3b82f6" }}>Submit New Project</h2>
        <div>
          <button style={{ marginRight: 8, padding: "6px 12px", background: "#eff6ff", border: "none", borderRadius: 6, cursor: "pointer" }}>Save Draft</button>
          <button
            onClick={handleBackToProjects} // Gắn sự kiện điều hướng
            style={{ padding: "6px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Back to Projects
          </button>
          </div>
      </div>
      <p style={{ color: "#64748b", marginBottom: 24 }}>Create a compelling project profile to attract investors</p>

      <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <h3 style={{ margin: "0 0 16px", color: "#3b82f6", display: "flex", alignItems: "center", gap: 8 }}>
          <InfoCircleOutlined style={{ color: "#000" }}/> Project Information
        </h3>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
              <InfoCircleOutlined style={{ color: "#000" }}/> Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter your project name"
              style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <UsergroupAddOutlined style={{ color: "#000" }}/> Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6, background: "#f3f4f6" }}
              >
                <option value="">Select category</option>
                <option value="tech">Technology</option>
                <option value="health">Healthcare</option>
                <option value="energy">Energy</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <DollarCircleOutlined style={{ color: "#000" }}/> Funding Stage *
              </label>
              <select
                value={fundingStage}
                onChange={(e) => setFundingStage(e.target.value)}
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6, background: "#f3f4f6" }}
              >
                <option value="">Select stage</option>
                <option value="seed">Seed</option>
                <option value="seriesA">Series A</option>
                <option value="seriesB">Series B</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <DollarCircleOutlined style={{ color: "#000" }}/> Funding Target *
              </label>
              <select
                value={fundingTarget}
                onChange={(e) => setFundingTarget(e.target.value)}
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6, background: "#f3f4f6" }}
              >
                <option value="">Select funding range</option>
                <option value="0-100k">$0 - $100K</option>
                <option value="100k-500k">$100K - $500K</option>
                <option value="500k-1m">$500K - $1M</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <UsergroupAddOutlined style={{ color: "#000" }}/> Team Size
              </label>
              <input
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                placeholder="Number of team members"
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <GlobalOutlined style={{ color: "#000" }}/> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <GlobalOutlined style={{ color: "#000" }}/> Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourproject.com"
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
              <FileTextOutlined style={{ color: "#000" }}/> Project Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6, minHeight: 100 }}
            />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
              <DollarCircleOutlined style={{ color: "#000" }}/> Use of Funds
            </label>
            <textarea
              value={useOfFunds}
              onChange={(e) => setUseOfFunds(e.target.value)}
              placeholder="Describe how funds will be used"
              style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6, minHeight: 100 }}
            />
          </div>
        </div>

        <div style={{ padding: 8, border: "2px solid #d1d5db", borderRadius: 6, marginTop: 24, background: "#f9fafb" }}>
        <h3 style={{ margin: "24px 0 16px", color: "#3b82f6", display: "flex", alignItems: "center", gap: 8 }}>
          <UploadOutlined style={{ color: "#000" }} /> Documents & Media
        </h3>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "auto auto" }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, color: "#3b82f6" }}>Pitch Deck (PDF) *</label>
            <label style={{ display: "block", padding: 8, border: "2px solid #d1d5db", borderRadius: 6, textAlign: "center", cursor: "pointer", opacity: 0.7 }}>
              <UploadOutlined style={{ fontSize: 24, color: "#000" }} />
              <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>Click to upload pitch deck</p>
              <p style={{ color: "#64748b", fontSize: 12 }}>PDF up to 10MB</p>
              <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, setPitchDeck)} style={{ display: "none" }} />
            </label>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, color: "#3b82f6" }}>Pitch Video (Optional)</label>
            <label style={{ display: "block", padding: 8, border: "2px solid #d1d5db", borderRadius: 6, textAlign: "center", cursor: "pointer", opacity: 0.7 }}>
              <VideoCameraOutlined style={{ fontSize: 24, color: "#000" }} />
              <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>Click to upload video</p>
              <p style={{ color: "#64748b", fontSize: 12 }}>MP4, MOV up to 100MB</p>
              <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, setPitchVideo)} style={{ display: "none" }} />
            </label>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, color: "#3b82f6" }}>Business Plan (Optional)</label>
            <label style={{ display: "block", padding: 8, border: "2px solid #d1d5db", borderRadius: 6, textAlign: "center", cursor: "pointer", opacity: 0.7 }}>
              <FileOutlined style={{ fontSize: 24, color: "#000" }} />
              <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>Click to upload business plan</p>
              <p style={{ color: "#64748b", fontSize: 12 }}>PDF, DOC up to 10MB</p>
              <input type="file" accept="application/pdf,application/msword" onChange={(e) => handleFileUpload(e, setBusinessPlan)} style={{ display: "none" }} />
            </label>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, color: "#3b82f6" }}>Financial Projections (Optional)</label>
            <label style={{ display: "block", padding: 8, border: "2px solid #d1d5db", borderRadius: 6, textAlign: "center", cursor: "pointer", opacity: 0.7 }}>
              <BarChartOutlined style={{ fontSize: 24, color: "#000" }} />
              <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>Click to upload financials</p>
              <p style={{ color: "#64748b", fontSize: 12 }}>PDF, XLS up to 10MB</p>
              <input type="file" accept="application/pdf,application/vnd.ms-excel" onChange={(e) => handleFileUpload(e, setFinancialProjections)} style={{ display: "none" }} />
            </label>
          </div>
        </div>
        </div>
        
        <div style={{ padding: 8, border: "2px solid #d1d5db", borderRadius: 6, marginTop: 24, background: "#f9fafb" }}>
            <h3 style={{ margin: "16px 0 16px", color: "#3b82f6", display: "flex", alignItems: "center", gap: 8 }}>
          <SafetyCertificateOutlined style={{ color: "#000" }} /> Privacy & Legal Settings
        </h3>
        </div>
      </div>
    </div>
  );
};

export default SubmitNewProject;