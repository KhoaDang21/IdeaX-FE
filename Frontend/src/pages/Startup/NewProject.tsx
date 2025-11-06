import React, { useState, type ChangeEvent, type FocusEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { App } from "antd";
import { createProject } from "../../services/features/project/projectSlice";
import { type AppDispatch } from "../../store";
import type { ProjectFormState } from "../../interfaces/project";
import { logActivity } from "../../utils/activityLogger";

// Import các component con
import { NewProjectHeader } from "../../components/startup/newproject/NewProjectHeader";
import { ProjectInfoForm } from "../../components/startup/newproject/ProjectInfoForm";
import { DocumentsMediaForm } from "../../components/startup/newproject/DocumentsMediaForm";

// ... (Interface ValidationErrors và Type FieldName giữ nguyên) ...
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
type FieldName = keyof ValidationErrors;

const fieldsByStep: FieldName[][] = [
  // Bước 0: ProjectInfoForm
  [
    "projectName",
    "category",
    "customCategory",
    "fundingStage",
    "fundingRange",
    "teamSize",
    "location",
    "website",
    "description",
  ],
  // Bước 1: DocumentsMediaForm
  ["pitchDeck", "pitchVideo", "businessPlan", "financialProjection"],
];

const stepTitles = ["Project Information", "Documents & Media"];

const SubmitNewProject: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  // --- STATE MANAGEMENT ---
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = stepTitles.length;

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

  // --- VALIDATION LOGIC --- (Giữ nguyên không đổi)
  const validateField = (
    name: FieldName,
    value: any,
    currentFormData: ProjectFormState,
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
      // File validations
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
      return url.startsWith("http:") || url.startsWith("https:");
    } catch {
      return false;
    }
  };

  const validateCurrentStep = (stepIndex: number): boolean => {
    const fieldsToValidate = fieldsByStep[stepIndex];
    if (!fieldsToValidate) return true;

    let isStepValid = true;
    const newErrors: ValidationErrors = { ...errors };
    const newTouched: Record<string, boolean> = { ...touched };

    fieldsToValidate.forEach((name) => {
      const value = formData[name as keyof ProjectFormState];
      const file = value instanceof File ? value : null;
      const textValue = value instanceof File ? "" : value;

      const error = validateField(name, textValue, formData, file);
      newErrors[name] = error;
      newTouched[name] = true;
      if (error) {
        isStepValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return isStepValid;
  };

  const validateForm = (currentFormData: ProjectFormState): boolean => {
    let allErrors: ValidationErrors = {};
    fieldsByStep.forEach((fields) => {
      fields.forEach((name) => {
        const value = currentFormData[name as keyof ProjectFormState];
        const file = value instanceof File ? value : null;
        const textValue = value instanceof File ? "" : value;
        const error = validateField(name, textValue, currentFormData, file);
        if (error) {
          allErrors[name] = error;
        }
      });
    });

    setErrors(allErrors);
    return !Object.values(allErrors).some(Boolean);
  };

  // --- EVENT HANDLERS --- (Giữ nguyên không đổi)
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    if (touched[name]) {
      const error = validateField(name as FieldName, value, updatedFormData);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const isFileField = fieldsByStep[1].includes(name as FieldName);
    const fileValue = isFileField
      ? (formData[name as keyof ProjectFormState] as File | null)
      : undefined;

    const error = validateField(name as FieldName, value, formData, fileValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    fieldName: keyof ProjectFormState
  ) => {
    const file = event.target.files?.[0] || null;
    const updatedFormData = { ...formData, [fieldName]: file };
    setFormData(updatedFormData);
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    const error = validateField(
      fieldName as FieldName,
      "",
      updatedFormData,
      file
    );
    setErrors((prev) => ({ ...prev, [fieldName]: error }));

    if (error && !file) {
      event.target.value = "";
    }
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo(0, 0);
      }
    } else {
      message.error("Please fix the errors on this page before proceeding.");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleFinalSubmit = (status: string) => {
    const allTouched = fieldsByStep
      .flat()
      .reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);

    if (!validateForm(formData)) {
      message.error("Please fix the validation errors before submitting.");

      for (let i = 0; i < fieldsByStep.length; i++) {
        if (!validateCurrentStep(i)) {
          setCurrentStep(i);
          break;
        }
      }
      return;
    }

    // --- FORM SUBMISSION LOGIC --- (Giữ nguyên)
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          submitData.append(key, value, value.name);
        } else if (typeof value === "string" && value.trim()) {
          submitData.append(key, value.trim());
        } else if (typeof value !== "string") {
          submitData.append(key, String(value));
        }
      }
    });
    submitData.append("status", status);

    setSubmitting(true);
    message.loading({
      content: "Creating project...",
      key: "createProject",
      duration: 0,
    });

    dispatch(createProject(submitData))
      .unwrap()
      .then((result) => {
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
          console.error(
            "Project creation result did not contain an ID:",
            result
          );
          message.error({
            content: "Project created, but failed to get project ID.",
            key: "createProject",
          });
          navigate("/startup/my-projects");
        }
      })
      .catch((error: any) => {
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
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      {/* **ĐÃ THAY ĐỔI**: Xóa props `onCreate` và `isLastStep` */}
      <NewProjectHeader
        submitting={submitting}
        onBack={handleBackToProjects}
        onCreate={function (): void {
          throw new Error("Function not implemented.");
        }}
        isLastStep={false}
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
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h3 style={{ color: "#3b82f6", margin: 0 }}>
            Step {currentStep + 1} of {totalSteps}: {stepTitles[currentStep]}
          </h3>
        </div>

        {currentStep === 0 && (
          <ProjectInfoForm
            formData={formData}
            errors={errors}
            touched={touched}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur}
          />
        )}

        {currentStep === 1 && (
          <DocumentsMediaForm
            formData={formData}
            errors={errors}
            touched={touched}
            handleFileChange={handleFileChange}
          />
        )}

        {/* **ĐÃ THAY ĐỔI**: Nút điều hướng các bước */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0 || submitting}
            style={{
              padding: "8px 16px",
              background:
                currentStep === 0 || submitting ? "#d1d5db" : "#6b7280",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor:
                currentStep === 0 || submitting ? "not-allowed" : "pointer",
              opacity: currentStep === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          {/* Nút "Next" (Chỉ hiển thị khi KHÔNG phải bước cuối) */}
          {currentStep < totalSteps - 1 && (
            <button
              onClick={handleNext}
              disabled={submitting}
              style={{
                padding: "8px 16px",
                background: submitting ? "#94a3b8" : "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          )}

          {/* Nút "Submit" (Chỉ hiển thị ở BƯỚC CUỐI) */}
          {currentStep === totalSteps - 1 && (
            <button
              onClick={() => handleFinalSubmit("DRAFT")} // Gọi hàm submit
              disabled={submitting}
              style={{
                padding: "8px 16px",
                background: submitting ? "#94a3b8" : "#3b82f6", // Style giống nút Next
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitNewProject;
