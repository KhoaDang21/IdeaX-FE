// src/pages/Startup/NewProject.tsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { createProject } from "../../services/features/project/projectSlice";
import { type AppDispatch, type RootState } from "../../store";

// Interface for validation errors với index signature
interface ValidationErrors {
  [key: string]: string | undefined;
  projectName?: string;
  category?: string;
  customCategory?: string;
  fundingStage?: string;
  fundingRange?: string;
  teamSize?: string;
  location?: string;
  website?: string;
  description?: string;
  pitchDeck?: string;
  pitchVideo?: string;
  businessPlan?: string;
  financialProjection?: string;
}

// Type cho field names
type FieldName = 
  | 'projectName' 
  | 'category' 
  | 'customCategory' 
  | 'fundingStage' 
  | 'fundingRange' 
  | 'teamSize' 
  | 'location' 
  | 'website' 
  | 'description' 
  | 'pitchDeck' 
  | 'pitchVideo' 
  | 'businessPlan' 
  | 'financialProjection';

const SubmitNewProject: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Lấy token từ Redux store
  const token = useSelector((state: RootState) => state.auth?.token);
  
  // Form states
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [fundingStage, setFundingStage] = useState("");
  const [fundingRange, setFundingRange] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [pitchVideo, setPitchVideo] = useState<File | null>(null);
  const [businessPlan, setBusinessPlan] = useState<File | null>(null);
  const [financialProjection, setFinancialProjection] = useState<File | null>(null);
  
  // Validation states
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation rules - TẤT CẢ CÁC TRƯỜNG ĐỀU BẮT BUỘC
  const validateField = (name: FieldName, value: any, file?: File | null): string => {
    switch (name) {
      case 'projectName':
        if (!value || value.trim().length === 0) {
          return 'Project name is required';
        }
        if (value.trim().length < 3) {
          return 'Project name must be at least 3 characters long';
        }
        if (value.trim().length > 100) {
          return 'Project name must be less than 100 characters';
        }
        return '';

      case 'category':
        if (!value) {
          return 'Category is required';
        }
        return '';

      case 'customCategory':
        if (category === 'OTHER' && (!value || value.trim().length === 0)) {
          return 'Custom category is required when selecting "Other"';
        }
        if (category === 'OTHER' && value.trim().length > 50) {
          return 'Custom category must be less than 50 characters';
        }
        return '';

      case 'fundingStage':
        if (!value) {
          return 'Funding stage is required';
        }
        return '';

      case 'fundingRange':
        if (!value) {
          return 'Funding range is required';
        }
        return '';

      case 'teamSize':
        if (!value) {
          return 'Team size is required';
        }
        const teamSizeNum = parseInt(value);
        if (isNaN(teamSizeNum) || teamSizeNum < 1 || teamSizeNum > 1000) {
          return 'Team size must be between 1 and 1000';
        }
        return '';

      case 'location':
        if (!value || value.trim().length === 0) {
          return 'Location is required';
        }
        if (value.trim().length > 100) {
          return 'Location must be less than 100 characters';
        }
        return '';

      case 'website':
        if (!value || value.trim().length === 0) {
          return 'Website is required';
        }
        if (!isValidUrl(value)) {
          return 'Please enter a valid URL (e.g., https://example.com)';
        }
        return '';

      case 'description':
        if (!value || value.trim().length === 0) {
          return 'Description is required';
        }
        if (value.trim().length < 50) {
          return 'Description must be at least 50 characters long';
        }
        if (value.trim().length > 2000) {
          return 'Description must be less than 2000 characters';
        }
        return '';

      case 'pitchDeck':
        if (!file) {
          return 'Pitch deck is required';
        }
        return validateFile(file, ['pdf'], 10 * 1024 * 1024); // 10MB

      case 'pitchVideo':
        if (!file) {
          return 'Pitch video is required';
        }
        return validateFile(file, ['mp4', 'mov', 'avi'], 100 * 1024 * 1024); // 100MB

      case 'businessPlan':
        if (!file) {
          return 'Business plan is required';
        }
        return validateFile(file, ['pdf', 'doc', 'docx'], 10 * 1024 * 1024); // 10MB

      case 'financialProjection':
        if (!file) {
          return 'Financial projection is required';
        }
        return validateFile(file, ['pdf', 'xls', 'xlsx'], 10 * 1024 * 1024); // 10MB

      default:
        return '';
    }
  };

  // File validation helper
  const validateFile = (file: File, allowedTypes: string[], maxSize: number): string => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return `File size too large. Maximum size: ${maxSizeMB}MB`;
    }
    
    return '';
  };

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    console.log("🔍 Validating form...");
    
    const newErrors: ValidationErrors = {};
    
    newErrors.projectName = validateField('projectName', projectName);
    newErrors.category = validateField('category', category);
    newErrors.customCategory = validateField('customCategory', customCategory);
    newErrors.fundingStage = validateField('fundingStage', fundingStage);
    newErrors.fundingRange = validateField('fundingRange', fundingRange);
    newErrors.teamSize = validateField('teamSize', teamSize);
    newErrors.location = validateField('location', location);
    newErrors.website = validateField('website', website);
    newErrors.description = validateField('description', description);
    newErrors.pitchDeck = validateField('pitchDeck', '', pitchDeck);
    newErrors.pitchVideo = validateField('pitchVideo', '', pitchVideo);
    newErrors.businessPlan = validateField('businessPlan', '', businessPlan);
    newErrors.financialProjection = validateField('financialProjection', '', financialProjection);

    setErrors(newErrors);
    
    const isValid = !Object.values(newErrors).some(error => error !== '');
    console.log("📋 Validation result:", isValid ? "VALID" : "INVALID", newErrors);
    
    return isValid;
  };

  // Handle field blur
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Handle file upload with validation
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>, 
    setFile: (file: File | null) => void, 
    fieldName: FieldName
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(`📁 File selected for ${fieldName}:`, file.name, `(${file.size} bytes)`);
      
      const error = validateField(fieldName, '', file);
      
      if (error) {
        console.log(`❌ File validation error for ${fieldName}:`, error);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
        event.target.value = ''; // Reset file input
        setFile(null);
      } else {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
        setFile(file);
        console.log(`✅ File validated successfully for ${fieldName}`);
      }
    } else {
      setErrors(prev => ({ 
        ...prev, 
        [fieldName]: `${fieldName} is required` 
      }));
      setFile(null);
    }
  };

  // Handle form submission
  const handleCreate = (status: string) => {
    console.log("🎯 handleCreate called with status:", status);
    console.log("🔐 Current token:", token);

    // Mark all fields as touched to show all errors
    const allFields: FieldName[] = [
      'projectName', 'category', 'customCategory', 'fundingStage', 
      'fundingRange', 'teamSize', 'location', 'website', 'description', 
      'pitchDeck', 'pitchVideo', 'businessPlan', 'financialProjection'
    ];
    
    const allTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      allTouched[field] = true;
    });
    
    setTouched(allTouched);

    if (!validateForm()) {
      console.log("❌ Form validation failed", errors);
      alert("Please fix the validation errors before submitting.");
      return;
    }

    console.log("✅ Form validation passed");

    // Tạo FormData object
    const submitData = new FormData();
    submitData.append("projectName", projectName.trim());
    submitData.append("category", category);
    if (customCategory) {
      submitData.append("customCategory", customCategory.trim());
    }
    submitData.append("fundingStage", fundingStage);
    submitData.append("fundingRange", fundingRange);
    submitData.append("teamSize", teamSize);
    submitData.append("location", location.trim());
    submitData.append("website", website.trim());
    submitData.append("description", description.trim());
    submitData.append("status", status);
    
    // Tất cả file đều bắt buộc
    if (pitchDeck) submitData.append("pitchDeck", pitchDeck);
    if (pitchVideo) submitData.append("pitchVideo", pitchVideo);
    if (businessPlan) submitData.append("businessPlan", businessPlan);
    if (financialProjection) submitData.append("financialProjection", financialProjection);

    // Thêm token vào FormData để sử dụng trong thunk
    if (token) {
      submitData.append("token", token);
    }

    // Debug: log form data
    console.log("📤 Submitting form data:");
    for (let [key, value] of submitData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, value.name, `(${value.size} bytes)`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    console.log("🚀 Dispatching createProject...");
    
    dispatch(createProject(submitData))
      .unwrap()
      .then((result) => {
        console.log("✅ Project created successfully:", result);
        alert("Project created successfully!");
        navigate("/startup/my-projects");
      })
      .catch((error: string) => {
        console.error("❌ Error creating project:", error);
        alert(`Failed to create project: ${error}`);
      });
  };

  const handleBackToProjects = () => {
    navigate("/startup/my-projects");
  };

  // Helper to check if field should show error
  const shouldShowError = (fieldName: string): boolean => {
    return !!touched[fieldName] && !!errors[fieldName];
  };

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: "#3b82f6" }}>Submit New Project</h2>
        <div>
          {/* Publish explicitly if user wants to publish immediately */}
          <button
            onClick={() => handleCreate("DRAFT")}
            style={{ marginRight: 8, padding: "6px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Draft
          </button>
          <button
            onClick={() => handleCreate("PUBLISHED")}
            style={{ marginRight: 8, padding: "6px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Submit
          </button>
          <button
            onClick={handleBackToProjects}
            style={{ padding: "6px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Back to Projects
          </button>
        </div>
      </div>
      <p style={{ color: "#64748b", marginBottom: 24 }}>Create a compelling project profile to attract investors. All fields are required.</p>

      <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <h3 style={{ margin: "0 0 16px", color: "#3b82f6", display: "flex", alignItems: "center", gap: 8 }}>
          <InfoCircleOutlined style={{ color: "#000" }} /> Project Information
        </h3>
        <div style={{ display: "grid", gap: 16 }}>
          {/* Project Name */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
              <InfoCircleOutlined style={{ color: "#000" }} /> Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setErrors(prev => ({ ...prev, projectName: validateField('projectName', e.target.value) }));
              }}
              onBlur={() => handleBlur('projectName')}
              placeholder="Enter your project name"
              style={{ 
                width: "100%", 
                padding: 8, 
                border: `1px solid ${shouldShowError('projectName') ? '#ef4444' : '#d1d5db'}`, 
                borderRadius: 6 
              }}
            />
            {shouldShowError('projectName') && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                <ExclamationCircleOutlined />
                <span>{errors.projectName}</span>
              </div>
            )}
          </div>

          {/* Category and Funding Stage */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <UsergroupAddOutlined style={{ color: "#000" }} /> Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setErrors(prev => ({ ...prev, category: validateField('category', e.target.value) }));
                }}
                onBlur={() => handleBlur('category')}
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: `1px solid ${shouldShowError('category') ? '#ef4444' : '#d1d5db'}`, 
                  borderRadius: 6, 
                  background: "#f3f4f6" 
                }}
              >
                <option value="">Select category</option>
                <option value="FINTECH">Fintech</option>
                <option value="HEALTHCARE">Healthcare</option>
                <option value="EDUCATION">Education</option>
                <option value="ECOMMERCE">Ecommerce</option>
                <option value="AI">AI</option>
                <option value="BLOCKCHAIN">Blockchain</option>
                <option value="GREEN_TECH">Green Tech</option>
                <option value="AGRICULTURE">Agriculture</option>
                <option value="OTHER">Other</option>
              </select>
              {shouldShowError('category') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.category}</span>
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <DollarCircleOutlined style={{ color: "#000" }} /> Funding Stage *
              </label>
              <select
                value={fundingStage}
                onChange={(e) => {
                  setFundingStage(e.target.value);
                  setErrors(prev => ({ ...prev, fundingStage: validateField('fundingStage', e.target.value) }));
                }}
                onBlur={() => handleBlur('fundingStage')}
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: `1px solid ${shouldShowError('fundingStage') ? '#ef4444' : '#d1d5db'}`, 
                  borderRadius: 6, 
                  background: "#f3f4f6" 
                }}
              >
                <option value="">Select stage</option>
                <option value="IDEA">Idea</option>
                <option value="SEED">Seed</option>
                <option value="SERIES_A">Series A</option>
                <option value="SERIES_B">Series B</option>
                <option value="SERIES_C">Series C</option>
                <option value="IPO">IPO</option>
              </select>
              {shouldShowError('fundingStage') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.fundingStage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Custom Category */}
          {category === "OTHER" && (
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <UsergroupAddOutlined style={{ color: "#000" }} /> Custom Category *
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setErrors(prev => ({ ...prev, customCategory: validateField('customCategory', e.target.value) }));
                }}
                onBlur={() => handleBlur('customCategory')}
                placeholder="Enter custom category"
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: `1px solid ${shouldShowError('customCategory') ? '#ef4444' : '#d1d5db'}`, 
                  borderRadius: 6 
                }}
              />
              {shouldShowError('customCategory') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.customCategory}</span>
                </div>
              )}
            </div>
          )}

          {/* Funding Range and Team Size */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <DollarCircleOutlined style={{ color: "#000" }} /> Funding Range *
              </label>
              <select
                value={fundingRange}
                onChange={(e) => {
                  setFundingRange(e.target.value);
                  setErrors(prev => ({ ...prev, fundingRange: validateField('fundingRange', e.target.value) }));
                }}
                onBlur={() => handleBlur('fundingRange')}
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: `1px solid ${shouldShowError('fundingRange') ? '#ef4444' : '#d1d5db'}`, 
                  borderRadius: 6, 
                  background: "#f3f4f6" 
                }}
              >
                <option value="">Select funding range</option>
                <option value="UNDER_50K">Under $50K</option>
                <option value="FROM_50K_TO_200K">From $50K to $200K</option>
                <option value="FROM_200K_TO_1M">From $200K to $1M</option>
                <option value="OVER_1M">Over $1M</option>
              </select>
              {shouldShowError('fundingRange') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.fundingRange}</span>
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <UsergroupAddOutlined style={{ color: "#000" }} /> Team Size *
              </label>
              <input
                type="number"
                value={teamSize}
                onChange={(e) => {
                  setTeamSize(e.target.value);
                  setErrors(prev => ({ ...prev, teamSize: validateField('teamSize', e.target.value) }));
                }}
                onBlur={() => handleBlur('teamSize')}
                placeholder="Number of team members"
                min="1"
                max="1000"
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: `1px solid ${shouldShowError('teamSize') ? '#ef4444' : '#d1d5db'}`, 
                  borderRadius: 6 
                }}
              />
              {shouldShowError('teamSize') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.teamSize}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location and Website */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <GlobalOutlined style={{ color: "#000" }} /> Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setErrors(prev => ({ ...prev, location: validateField('location', e.target.value) }));
                }}
                onBlur={() => handleBlur('location')}
                placeholder="City, Country"
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: `1px solid ${shouldShowError('location') ? '#ef4444' : '#d1d5db'}`, 
                  borderRadius: 6 
                }}
              />
              {shouldShowError('location') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.location}</span>
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
                <GlobalOutlined style={{ color: "#000" }} /> Website *
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  setErrors(prev => ({ ...prev, website: validateField('website', e.target.value) }));
                }}
                onBlur={() => handleBlur('website')}
                placeholder="https://yourproject.com"
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: `1px solid ${shouldShowError('website') ? '#ef4444' : '#d1d5db'}`, 
                  borderRadius: 6 
                }}
              />
              {shouldShowError('website') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "#3b82f6" }}>
              <FileTextOutlined style={{ color: "#000" }} /> Project Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors(prev => ({ ...prev, description: validateField('description', e.target.value) }));
              }}
              onBlur={() => handleBlur('description')}
              placeholder="Enter project description (minimum 50 characters)"
              style={{ 
                width: "100%", 
                padding: 8, 
                border: `1px solid ${shouldShowError('description') ? '#ef4444' : '#d1d5db'}`, 
                borderRadius: 6, 
                minHeight: 100 
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              {shouldShowError('description') ? (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.description}</span>
                </div>
              ) : (
                <div style={{ color: "#64748b", fontSize: 12 }}>
                  {description.trim().length}/2000 characters
                </div>
              )}
              <div style={{ color: "#64748b", fontSize: 12 }}>
                Minimum 50 characters required
              </div>
            </div>
          </div>
        </div>

        {/* Documents & Media Section */}
        <div style={{ padding: 8, border: "2px solid #d1d5db", borderRadius: 6, marginTop: 24, background: "#f9fafb" }}>
          <h3 style={{ margin: "24px 0 16px", color: "#3b82f6", display: "flex", alignItems: "center", gap: 8 }}>
            <UploadOutlined style={{ color: "#000" }} /> Documents & Media
          </h3>
          <p style={{ color: "#64748b", marginBottom: 16, fontSize: 14 }}>
            All documents are required for a complete project submission.
          </p>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "auto auto" }}>
            {/* Pitch Deck */}
            <div>
              <label style={{ display: "block", marginBottom: 4, color: "#3b82f6" }}>Pitch Deck (PDF) *</label>
              <label style={{ 
                display: "block", 
                padding: 8, 
                border: `2px solid ${shouldShowError('pitchDeck') ? '#ef4444' : '#d1d5db'}`, 
                borderRadius: 6, 
                textAlign: "center", 
                cursor: "pointer", 
                opacity: 0.7 
              }}>
                <UploadOutlined style={{ fontSize: 24, color: "#000" }} />
                <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>
                  {pitchDeck ? pitchDeck.name : 'Click to upload pitch deck'}
                </p>
                <p style={{ color: "#64748b", fontSize: 12 }}>PDF up to 10MB</p>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => handleFileUpload(e, setPitchDeck, 'pitchDeck')} 
                  style={{ display: "none" }} 
                />
              </label>
              {shouldShowError('pitchDeck') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.pitchDeck}</span>
                </div>
              )}
            </div>

            {/* Pitch Video */}
            <div>
              <label style={{ display: "block", marginBottom: 4, color: "#3b82f6" }}>Pitch Video *</label>
              <label style={{ 
                display: "block", 
                padding: 8, 
                border: `2px solid ${shouldShowError('pitchVideo') ? '#ef4444' : '#d1d5db'}`, 
                borderRadius: 6, 
                textAlign: "center", 
                cursor: "pointer", 
                opacity: 0.7 
              }}>
                <VideoCameraOutlined style={{ fontSize: 24, color: "#000" }} />
                <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>
                  {pitchVideo ? pitchVideo.name : 'Click to upload video'}
                </p>
                <p style={{ color: "#64748b", fontSize: 12 }}>MP4, MOV up to 100MB</p>
                <input 
                  type="file" 
                  accept=".mp4,.mov,.avi" 
                  onChange={(e) => handleFileUpload(e, setPitchVideo, 'pitchVideo')} 
                  style={{ display: "none" }} 
                />
              </label>
              {shouldShowError('pitchVideo') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.pitchVideo}</span>
                </div>
              )}
            </div>

            {/* Business Plan */}
            <div>
              <label style={{ display: "block", marginBottom: 4, color: "#3b82f6" }}>Business Plan *</label>
              <label style={{ 
                display: "block", 
                padding: 8, 
                border: `2px solid ${shouldShowError('businessPlan') ? '#ef4444' : '#d1d5db'}`, 
                borderRadius: 6, 
                textAlign: "center", 
                cursor: "pointer", 
                opacity: 0.7 
              }}>
                <FileOutlined style={{ fontSize: 24, color: "#000" }} />
                <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>
                  {businessPlan ? businessPlan.name : 'Click to upload business plan'}
                </p>
                <p style={{ color: "#64748b", fontSize: 12 }}>PDF, DOC up to 10MB</p>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  onChange={(e) => handleFileUpload(e, setBusinessPlan, 'businessPlan')} 
                  style={{ display: "none" }} 
                />
              </label>
              {shouldShowError('businessPlan') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.businessPlan}</span>
                </div>
              )}
            </div>

            {/* Financial Projection */}
            <div>
              <label style={{ display: "block", marginBottom: 4, color: "#3b82f6" }}>Financial Projection *</label>
              <label style={{ 
                display: "block", 
                padding: 8, 
                border: `2px solid ${shouldShowError('financialProjection') ? '#ef4444' : '#d1d5db'}`, 
                borderRadius: 6, 
                textAlign: "center", 
                cursor: "pointer", 
                opacity: 0.7 
              }}>
                <BarChartOutlined style={{ fontSize: 24, color: "#000" }} />
                <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>
                  {financialProjection ? financialProjection.name : 'Click to upload financials'}
                </p>
                <p style={{ color: "#64748b", fontSize: 12 }}>PDF, XLS up to 10MB</p>
                <input 
                  type="file" 
                  accept=".pdf,.xls,.xlsx" 
                  onChange={(e) => handleFileUpload(e, setFinancialProjection, 'financialProjection')} 
                  style={{ display: "none" }} 
                />
              </label>
              {shouldShowError('financialProjection') && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "#ef4444", fontSize: 12 }}>
                  <ExclamationCircleOutlined />
                  <span>{errors.financialProjection}</span>
                </div>
              )}
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