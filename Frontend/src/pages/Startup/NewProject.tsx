import React, { useState, type ChangeEvent, type FocusEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { App } from "antd"; // Import App for message context
import { createProject } from "../../services/features/project/projectSlice";
import { type AppDispatch } from "../../store";
import type { ProjectFormState } from "../../interfaces/project";
import { logActivity } from "../../utils/activityLogger";

// Import các component con
import { NewProjectHeader } from "../../components/startup/newproject/NewProjectHeader";
import { ProjectInfoForm } from "../../components/startup/newproject/ProjectInfoForm";
import { DocumentsMediaForm } from "../../components/startup/newproject/DocumentsMediaForm";
import { PrivacyLegalSection } from "../../components/startup/newproject/PrivacyLegalSection";

// Interface for validation errors (giữ lại hoặc export/import từ file riêng)
export interface ValidationErrors {
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

// Type for field names (giữ lại hoặc export/import từ file riêng)
type FieldName = keyof ValidationErrors;

const SubmitNewProject: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { message } = App.useApp(); // Use Ant Design's message hook

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState<ProjectFormState>({
    projectName: "",
    category: "",
    customCategory: "",
    fundingStage: "",
    fundingRange: "",
    teamSize: "",
    location: "",
    website: "",
    description: "",
    pitchDeck: null,
    pitchVideo: null,
    businessPlan: null,
    financialProjection: null,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  // --- VALIDATION LOGIC --- (Giữ nguyên)
  const validateField = (
    name: FieldName,
    value: any,
    currentFormData: ProjectFormState, // Pass current form data for context
    file?: File | null
  ): string => {
    switch (name) {
      case "projectName":
        if (!value || value.trim().length === 0)
          return "Project name is required";
        if (value.trim().length < 3)
          return "Project name must be at least 3 characters long";
        if (value.trim().length > 100)
          return "Project name must be less than 100 characters";
        return "";
      case "category":
        if (!value) return "Category is required";
        return "";
      case "customCategory":
        if (
          currentFormData.category === "OTHER" &&
          (!value || value.trim().length === 0)
        )
          return 'Custom category is required when selecting "Other"';
        if (currentFormData.category === "OTHER" && value.trim().length > 50)
          return "Custom category must be less than 50 characters";
        return "";
      case "fundingStage":
        if (!value) return "Funding stage is required";
        return "";
      case "fundingRange":
        if (!value) return "Funding range is required";
        return "";
      case "teamSize":
        if (!value) return "Team size is required";
        const teamSizeNum = parseInt(value);
        if (isNaN(teamSizeNum) || teamSizeNum < 1 || teamSizeNum > 1000)
          return "Team size must be between 1 and 1000";
        return "";
      case "location":
        if (!value || value.trim().length === 0) return "Location is required";
        if (value.trim().length > 100)
          return "Location must be less than 100 characters";
        return "";
      case "website":
        if (!value || value.trim().length === 0) return "Website is required";
        if (!isValidUrl(value))
          return "Please enter a valid URL (e.g., https://example.com)";
        return "";
      case "description":
        if (!value || value.trim().length === 0)
          return "Description is required";
        if (value.trim().length < 10)
          return "Description must be at least 10 characters long";
        if (value.trim().length > 2000)
          return "Description must be less than 2000 characters";
        return "";
      // File validations (only check if file is provided)
      case "pitchDeck":
        return file
          ? validateFile(file, ["pdf"], 10 * 1024 * 1024)
          : "Pitch deck is required";
      case "pitchVideo":
        return file
          ? validateFile(file, ["mp4", "mov", "avi"], 100 * 1024 * 1024)
          : "Pitch video is required";
      case "businessPlan":
        return file
          ? validateFile(file, ["pdf", "doc", "docx"], 10 * 1024 * 1024)
          : "Business plan is required";
      case "financialProjection":
        return file
          ? validateFile(file, ["pdf", "xls", "xlsx"], 10 * 1024 * 1024)
          : "Financial projection is required";
      default:
        return "";
    }
  };

  const validateFile = (
    file: File,
    allowedTypes: string[],
    maxSize: number
  ): string => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension))
      return `Allowed types: ${allowedTypes.join(", ")}`;
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return `Max size: ${maxSizeMB}MB`;
    }
    return "";
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      // Check if protocol is http or https
      return url.startsWith("http:") || url.startsWith("https:");
    } catch {
      return false;
    }
  };

  const validateForm = (currentFormData: ProjectFormState): boolean => {
    const newErrors: ValidationErrors = {
      projectName: validateField(
        "projectName",
        currentFormData.projectName,
        currentFormData
      ),
      category: validateField(
        "category",
        currentFormData.category,
        currentFormData
      ),
      customCategory: validateField(
        "customCategory",
        currentFormData.customCategory,
        currentFormData
      ),
      fundingStage: validateField(
        "fundingStage",
        currentFormData.fundingStage,
        currentFormData
      ),
      fundingRange: validateField(
        "fundingRange",
        currentFormData.fundingRange,
        currentFormData
      ),
      teamSize: validateField(
        "teamSize",
        currentFormData.teamSize,
        currentFormData
      ),
      location: validateField(
        "location",
        currentFormData.location,
        currentFormData
      ),
      website: validateField(
        "website",
        currentFormData.website,
        currentFormData
      ),
      description: validateField(
        "description",
        currentFormData.description,
        currentFormData
      ),
      pitchDeck: validateField(
        "pitchDeck",
        "",
        currentFormData,
        currentFormData.pitchDeck
      ),
      pitchVideo: validateField(
        "pitchVideo",
        "",
        currentFormData,
        currentFormData.pitchVideo
      ),
      businessPlan: validateField(
        "businessPlan",
        "",
        currentFormData,
        currentFormData.businessPlan
      ),
      financialProjection: validateField(
        "financialProjection",
        "",
        currentFormData,
        currentFormData.financialProjection
      ),
    };
    setErrors(newErrors);
    // Return true if there are no error messages (all values are empty strings)
    return !Object.values(newErrors).some(Boolean); // Check if any error exists
  };

  // --- EVENT HANDLERS ---
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Create a temporary updated form data object for validation context
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData); // Update the state

    // Validate field on change only if it was already touched
    if (touched[name]) {
      const error = validateField(name as FieldName, value, updatedFormData); // Pass updated data
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true })); // Mark field as touched

    // Determine if it's a file field based on name convention
    const isFileField = [
      "pitchDeck",
      "pitchVideo",
      "businessPlan",
      "financialProjection",
    ].includes(name);
    const fileValue = isFileField
      ? (formData[name as keyof ProjectFormState] as File | null)
      : undefined;

    // Validate field on blur using the current formData state
    const error = validateField(name as FieldName, value, formData, fileValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    fieldName: keyof ProjectFormState // Use keyof to ensure valid field names
  ) => {
    const file = event.target.files?.[0] || null;
    // Create updated form data state immediately
    const updatedFormData = { ...formData, [fieldName]: file };
    setFormData(updatedFormData);
    setTouched((prev) => ({ ...prev, [fieldName]: true })); // Mark as touched

    // Validate the file immediately using the updated state context
    const error = validateField(
      fieldName as FieldName,
      "",
      updatedFormData,
      file
    );
    setErrors((prev) => ({ ...prev, [fieldName]: error }));

    // If there's an error and no file is actually selected (e.g., user cancelled),
    // clear the HTML input value so they can re-select the same file if needed.
    if (error && !file) {
      event.target.value = "";
    }
  };

  const handleCreate = (status: string) => {
    // Mark all fields as touched to show errors on submit attempt
    const allFields = Object.keys(formData) as FieldName[];
    setTouched(
      allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    // Validate the entire form using the current formData
    if (!validateForm(formData)) {
      message.error("Please fix the validation errors before submitting.");
      return;
    }

    // --- FORM SUBMISSION LOGIC --- (Giữ nguyên)
    const submitData = new FormData();
    // Iterate over formData and append valid data
    Object.entries(formData).forEach(([key, value]) => {
      // Check if value is not null or undefined
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          // Append file with its name
          submitData.append(key, value, value.name);
        } else if (typeof value === "string" && value.trim()) {
          // Append trimmed non-empty string
          submitData.append(key, value.trim());
        } else if (typeof value !== "string") {
          // Append numbers or other types (convert to string)
          submitData.append(key, String(value));
        }
        // Empty strings are implicitly skipped
      }
    });
    submitData.append("status", status); // Always append status

    setSubmitting(true);
    message.loading({
      content: "Creating project...",
      key: "createProject",
      duration: 0,
    });

    dispatch(createProject(submitData))
      .unwrap()
      .then((result) => {
        // Ensure result is not null and has an 'id' property
        if (result && result.id) {
          logActivity({
            action: "Created new project",
            projectId: String(result.id),
            timestamp: Date.now(),
          });
          message.success({
            content: "Project created successfully!",
            key: "createProject",
          });
          navigate("/startup/my-projects");
        } else {
          // Handle cases where result might be unexpected
          console.error(
            "Project creation result did not contain an ID:",
            result
          );
          message.error({
            content: "Project created, but failed to get project ID.",
            key: "createProject",
          });
          navigate("/startup/my-projects"); // Navigate anyway or handle differently
        }
      })
      .catch((error: any) => {
        // Catch specific error type if possible
        // Attempt to parse a more specific error message if available
        const errorMessage =
          typeof error === "string"
            ? error
            : error?.payload?.message ||
              error?.message ||
              "An unknown error occurred";
        message.error({
          content: `Failed to create project: ${errorMessage}`,
          key: "createProject",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleBackToProjects = () => {
    navigate("/startup/my-projects");
  };

  // --- RENDER ---
  return (
    // If using App.useApp(), ensure <App> wraps your application root in main.tsx or App.tsx
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <NewProjectHeader
        submitting={submitting}
        onCreate={handleCreate}
        onBack={handleBackToProjects}
      />
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Create a compelling project profile to attract investors. All fields
        marked * are required.
      </p>

      {/* Main form container */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        {/* Project Information Section */}
        <ProjectInfoForm
          formData={formData}
          errors={errors}
          touched={touched}
          handleInputChange={handleInputChange}
          handleBlur={handleBlur}
        />

        {/* Documents & Media Section */}
        <DocumentsMediaForm
          formData={formData}
          errors={errors}
          touched={touched}
          handleFileChange={handleFileChange}
        />

        {/* Privacy & Legal Section */}
        <PrivacyLegalSection />
      </div>
    </div>
  );
};

export default SubmitNewProject;
