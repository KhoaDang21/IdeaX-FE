import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProjectById,
  clearProject,
} from "../../services/features/project/projectSlice";
import type { RootState, AppDispatch } from "../../store";
import { App, Card, Row, Col, Tag } from "antd";
import {
  InfoCircleOutlined,
  UsergroupAddOutlined,
  DollarCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
  UploadOutlined,
  VideoCameraOutlined,
  FileOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { getFundingRangeDisplay } from "../../utils/projectUtils";

// Utility to format status text
const getStatusText = (status: string): string => {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "In Deal";
    case "DRAFT":
      return "Pending Review";
    case "PUBLISHED":
      return "Active";
    case "REJECTED":
      return "Rejected";
    default:
      return status || "Unknown";
  }
};

// Utility to get status style
const getStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return { background: "#dcfce7", color: "#16a34a" };
    case "DRAFT":
      return { background: "#fef3c7", color: "#92400e" };
    case "PUBLISHED":
      return { background: "#dbeafe", color: "#1e40af" };
    case "REJECTED":
      return { background: "#fee2e2", color: "#ef4444" };
    default:
      return { background: "#e5e7eb", color: "#6b7280" };
  }
};

// Utility to extract filename from URL or path
const getFileName = (url: string | null): string => {
  if (!url) return "No file uploaded";

  try {
    // If it's a full URL, extract the filename
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split("/").pop() || "Download file";
  } catch {
    // If it's just a path/filename
    return url.split("/").pop() || "Download file";
  }
};

// Utility to get file URL by type from files array
const getFileUrlByType = (files: any[], fileType: string): string | null => {
  if (!files || !Array.isArray(files)) return null;
  const file = files.find((f) => f.fileType === fileType);
  return file ? file.fileUrl : null;
};

const ProjectDetails: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const { project, status, error } = useSelector(
    (state: RootState) => state.project
  );

  useEffect(() => {
    if (id) {
      dispatch(getProjectById(Number(id)))
        .unwrap()
        .catch((err: string) => {
          console.error("Error fetching project:", err);
          message.error(`Failed to load project: ${err}`);
        });
    }
    return () => {
      dispatch(clearProject());
    };
  }, [dispatch, id, message]);

  const handleBack = () => {
    navigate("/startup/my-projects");
  };

  if (status === "loading") {
    return (
      <div
        style={{
          padding: 24,
          background: "#f9fafb",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#64748b", fontSize: 16 }}>
          Loading project details...
        </div>
      </div>
    );
  }

  if (status === "failed" || !project || project.id !== Number(id)) {
    return (
      <div
        style={{
          padding: 24,
          background: "#f9fafb",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: "#ef4444", marginBottom: 16 }}>
            {error || "Project not found"}
          </p>
          <button
            onClick={handleBack}
            style={{
              padding: "8px 16px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(project.status);

  // Document items with file names from files array
  const documentItems = [
    {
      key: "pitchDeck",
      label: "Pitch Deck (PDF)",
      icon: <FileOutlined />,
      desc: "PDF up to 10MB",
      fileType: "PITCH_DECK",
      url: getFileUrlByType(project.files || [], "PITCH_DECK"),
      fileName: getFileName(
        getFileUrlByType(project.files || [], "PITCH_DECK")
      ),
    },
    {
      key: "pitchVideo",
      label: "Pitch Video",
      icon: <VideoCameraOutlined />,
      desc: "MP4, MOV up to 100MB",
      fileType: "PITCH_VIDEO",
      url: getFileUrlByType(project.files || [], "PITCH_VIDEO"),
      fileName: getFileName(
        getFileUrlByType(project.files || [], "PITCH_VIDEO")
      ),
    },
    {
      key: "businessPlan",
      label: "Business Plan",
      icon: <FileTextOutlined />,
      desc: "PDF, DOC up to 10MB",
      fileType: "BUSINESS_PLAN",
      url: getFileUrlByType(project.files || [], "BUSINESS_PLAN"),
      fileName: getFileName(
        getFileUrlByType(project.files || [], "BUSINESS_PLAN")
      ),
    },
    {
      key: "financialProjection",
      label: "Financial Projection",
      icon: <BarChartOutlined />,
      desc: "PDF, XLS up to 10MB",
      fileType: "FINANCIAL_PROJECTION",
      url: getFileUrlByType(project.files || [], "FINANCIAL_PROJECTION"),
      fileName: getFileName(
        getFileUrlByType(project.files || [], "FINANCIAL_PROJECTION")
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        background: "linear-gradient(135deg, #f9fafb 0%, #e0e7ff 100%)",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          background: "#fff",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0, color: "#1e40af", fontSize: 24 }}>
              {project.projectName || "Untitled Project"}
            </h2>
            <Tag
              style={{
                marginLeft: 8,
                ...statusStyle,
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {getStatusText(project.status)}
            </Tag>
          </div>
          <button
            onClick={handleBack}
            style={{
              padding: "8px 16px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
          >
            Back to Projects
          </button>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span
                style={{
                  color: "#1e40af",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <InfoCircleOutlined /> Project Information
              </span>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: "#64748b", fontWeight: 500 }}>
                    Project Name
                  </label>
                  <p style={{ color: "#1e293b", fontSize: 16 }}>
                    {project.projectName || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <UsergroupAddOutlined /> Category
                  </label>
                  <p style={{ color: "#1e293b" }}>
                    {project.category === "OTHER" && project.customCategory
                      ? project.customCategory
                      : project.category || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <DollarCircleOutlined /> Funding Stage
                  </label>
                  <p style={{ color: "#1e293b" }}>
                    {project.fundingStage || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <DollarCircleOutlined /> Funding Range
                  </label>
                  <p style={{ color: "#1e293b" }}>
                    {getFundingRangeDisplay(project.fundingRange || "")}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <UsergroupAddOutlined /> Team Size
                  </label>
                  <p style={{ color: "#1e293b" }}>
                    {project.teamSize || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <GlobalOutlined /> Location
                  </label>
                  <p style={{ color: "#1e293b" }}>
                    {project.location || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <GlobalOutlined /> Website
                  </label>
                  <a
                    href={project.website || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3b82f6", textDecoration: "none" }}
                  >
                    {project.website || "N/A"}
                  </a>
                </div>
              </Col>
              <Col span={24}>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <FileTextOutlined /> Project Description
                  </label>
                  <p style={{ color: "#1e293b", whiteSpace: "pre-wrap" }}>
                    {project.description || "N/A"}
                  </p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <span
                style={{
                  color: "#1e40af",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <UploadOutlined /> Documents & Media
              </span>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Row gutter={[16, 16]}>
              {documentItems.map((item) => (
                <Col xs={24} key={item.key}>
                  <a
                    href={item.url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      padding: 12,
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      textDecoration: "none",
                      background: "#f9fafb",
                      transition: "all 0.3s",
                      opacity: item.url ? 1 : 0.6,
                      pointerEvents: item.url ? "auto" : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#e0e7ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div style={{ fontSize: 24, color: "#1e40af" }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            color: "#1e293b",
                            fontWeight: 500,
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{ margin: 4, color: "#64748b", fontSize: 12 }}
                        >
                          {item.desc}
                        </p>
                        {/* Hiển thị tên file đã upload */}
                        <p
                          style={{
                            margin: 4,
                            color: item.url ? "#16a34a" : "#ef4444",
                            fontSize: 12,
                            fontWeight: 500,
                            fontStyle: "italic",
                          }}
                        >
                          {item.fileName}
                        </p>
                      </div>
                    </div>
                  </a>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDetails;
