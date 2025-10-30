import type { FC, ChangeEvent } from "react";
import {
  UploadOutlined,
  VideoCameraOutlined,
  FileOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import type { ProjectFormState } from "../../../interfaces/project";
import type { ValidationErrors } from "../../../pages/Startup/NewProject"; // Assuming ValidationErrors is exported from parent
import { FileUploadField } from "./FileUploadField";

interface Props {
  formData: ProjectFormState;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  handleFileChange: (
    event: ChangeEvent<HTMLInputElement>,
    fieldName: keyof ProjectFormState
  ) => void;
}

export const DocumentsMediaForm: FC<Props> = ({
  formData,
  errors,
  touched,
  handleFileChange,
}) => {
  return (
    <div
      style={{
        padding: "16px", // Added padding inside the border
        border: "1px solid #e5e7eb", // Use a lighter border
        borderRadius: 8, // Slightly more rounded
        marginTop: 24,
        background: "#ffffff", // White background for contrast
      }}
    >
      <h3
        style={{
          margin: "0 0 16px", // Adjusted margin
          color: "#3b82f6",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "1.1rem", // Slightly larger heading
        }}
      >
        <UploadOutlined style={{ color: "#000" }} /> Documents & Media
      </h3>
      <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
        All documents are required for a complete project submission.
      </p>
      <div
        style={{
          display: "grid",
          gap: 20, // Increased gap
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // Responsive grid
        }}
      >
        <FileUploadField
          label="Pitch Deck (PDF)"
          name="pitchDeck"
          icon={<UploadOutlined style={{ fontSize: 24, color: "#6b7280" }} />}
          fileName={formData.pitchDeck?.name}
          accept=".pdf"
          description="PDF up to 10MB"
          error={errors.pitchDeck}
          touched={touched.pitchDeck}
          onChange={(e) => handleFileChange(e, "pitchDeck")}
        />

        <FileUploadField
          label="Pitch Video"
          name="pitchVideo"
          icon={
            <VideoCameraOutlined style={{ fontSize: 24, color: "#6b7280" }} />
          }
          fileName={formData.pitchVideo?.name}
          accept=".mp4,.mov,.avi"
          description="MP4, MOV, AVI up to 100MB"
          error={errors.pitchVideo}
          touched={touched.pitchVideo}
          onChange={(e) => handleFileChange(e, "pitchVideo")}
        />

        <FileUploadField
          label="Business Plan"
          name="businessPlan"
          icon={<FileOutlined style={{ fontSize: 24, color: "#6b7280" }} />}
          fileName={formData.businessPlan?.name}
          accept=".pdf,.doc,.docx"
          description="PDF, DOC(X) up to 10MB"
          error={errors.businessPlan}
          touched={touched.businessPlan}
          onChange={(e) => handleFileChange(e, "businessPlan")}
        />

        <FileUploadField
          label="Financial Projection"
          name="financialProjection"
          icon={<BarChartOutlined style={{ fontSize: 24, color: "#6b7280" }} />}
          fileName={formData.financialProjection?.name}
          accept=".pdf,.xls,.xlsx"
          description="PDF, XLS(X) up to 10MB"
          error={errors.financialProjection}
          touched={touched.financialProjection}
          onChange={(e) => handleFileChange(e, "financialProjection")}
        />
      </div>
    </div>
  );
};
