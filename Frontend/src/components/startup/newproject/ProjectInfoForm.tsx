import type { FC, ChangeEvent, FocusEvent } from "react";
import {
  InfoCircleOutlined,
  UsergroupAddOutlined,
  DollarCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { ProjectFormState } from "../../../interfaces/project";
type ValidationErrors = any;
import { FormField } from "./FormField";

interface Props {
  formData: ProjectFormState;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleBlur: (
    e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}

// Options for select dropdowns
const categoryOptions = [
  { value: "FINTECH", label: "Fintech" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "EDUCATION", label: "Education" },
  { value: "ECOMMERCE", label: "Ecommerce" },
  { value: "AI", label: "AI" },
  { value: "BLOCKCHAIN", label: "Blockchain" },
  { value: "GREEN_TECH", label: "Green Tech" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "OTHER", label: "Other" },
];

const fundingStageOptions = [
  { value: "IDEA", label: "Idea" },
  { value: "SEED", label: "Seed" },
  { value: "SERIES_A", label: "Series A" },
  { value: "SERIES_B", label: "Series B" },
  { value: "SERIES_C", label: "Series C" },
  { value: "IPO", label: "IPO" },
];

const fundingRangeOptions = [
  { value: "UNDER_50K", label: "Under $50K" },
  { value: "FROM_50K_TO_200K", label: "From $50K to $200K" },
  { value: "FROM_200K_TO_1M", label: "From $200K to $1M" },
  { value: "OVER_1M", label: "Over $1M" },
];

export const ProjectInfoForm: FC<Props> = ({
  formData,
  errors,
  touched,
  handleInputChange,
  handleBlur,
}) => {
  return (
    <>
      <h3
        style={{
          margin: "0 0 16px",
          color: "#3b82f6",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <InfoCircleOutlined style={{ color: "#000" }} /> Project Information
      </h3>
      <div style={{ display: "grid", gap: 16 }}>
        <FormField
          label="Project Name"
          icon={<InfoCircleOutlined style={{ color: "#000" }} />}
          name="projectName"
          value={formData.projectName}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.projectName}
          touched={touched.projectName}
          placeholder="Enter your project name"
        />

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <FormField
              label="Category"
              icon={<UsergroupAddOutlined style={{ color: "#000" }} />}
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.category}
              touched={touched.category}
              options={categoryOptions}
              placeholder="Select category"
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="Funding Stage"
              icon={<DollarCircleOutlined style={{ color: "#000" }} />}
              name="fundingStage"
              value={formData.fundingStage}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.fundingStage}
              touched={touched.fundingStage}
              options={fundingStageOptions}
              placeholder="Select stage"
            />
          </div>
        </div>

        {formData.category === "OTHER" && (
          <FormField
            label="Custom Category"
            icon={<UsergroupAddOutlined style={{ color: "#000" }} />}
            name="customCategory"
            // Ensure value is always a string, even if undefined in formData
            value={formData.customCategory || ""}
            onChange={handleInputChange}
            onBlur={handleBlur}
            error={errors.customCategory}
            touched={touched.customCategory}
            placeholder="Enter custom category"
          />
        )}

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <FormField
              label="Funding Range"
              icon={<DollarCircleOutlined style={{ color: "#000" }} />}
              name="fundingRange"
              value={formData.fundingRange}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.fundingRange}
              touched={touched.fundingRange}
              options={fundingRangeOptions}
              placeholder="Select funding range"
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="Team Size"
              icon={<UsergroupAddOutlined style={{ color: "#000" }} />}
              name="teamSize"
              type="number"
              value={formData.teamSize}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.teamSize}
              touched={touched.teamSize}
              placeholder="Number of team members"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <FormField
              label="Location"
              icon={<GlobalOutlined style={{ color: "#000" }} />}
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.location}
              touched={touched.location}
              placeholder="City, Country"
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="Website"
              icon={<GlobalOutlined style={{ color: "#000" }} />}
              name="website"
              type="url"
              // Ensure value is always a string
              value={formData.website || ""}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.website}
              touched={touched.website}
              placeholder="https://yourproject.com"
            />
          </div>
        </div>

        <FormField
          label="Project Description"
          icon={<FileTextOutlined style={{ color: "#000" }} />}
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.description}
          touched={touched.description}
          placeholder="Enter project description (minimum 10 characters)"
          isTextArea={true}
          maxLength={2000}
        />
      </div>
    </>
  );
};
