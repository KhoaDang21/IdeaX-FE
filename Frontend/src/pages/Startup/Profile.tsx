import React, { useEffect, useMemo, useState } from "react";
import { UserOutlined, BankOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { getStartupProfile, updateStartupProfile } from "../../services/features/auth/authSlice";
import { App } from "antd";

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);

  // Local form state mapped 1:1 với StartupProfileResponse
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    linkedInProfile: "",
    companyWebsite: "",
    profilePictureUrl: "",
    companyLogo: "",
    startupName: "",
    industryCategory: "",
    fundingStage: "",
    location: "",
    numberOfTeamMembers: "",
    aboutUs: "",
  });

  // File state for uploads
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.role === "startup" && user.id) {
      (dispatch(getStartupProfile(user.id) as any));
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    setForm(f => ({
      ...f,
      fullName: user.fullName || "",
      phoneNumber: user.phoneNumber || "",
      linkedInProfile: user.linkedInProfile || "",
      companyWebsite: user.companyWebsite || "",
      profilePictureUrl: user.profilePictureUrl || "",
      companyLogo: user.companyLogo || "",
      startupName: user.startupName || "",
      industryCategory: user.industryCategory || "",
      fundingStage: user.fundingStage || "",
      location: user.location || "",
      numberOfTeamMembers: user.numberOfTeamMembers?.toString() || "",
      aboutUs: user.aboutUs || "",
    }));
  }, [user]);

  const initials = useMemo(() => {
    if (form.fullName) return form.fullName.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return "U";
  }, [form.fullName, user?.email]);

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Upload file to backend and set returned URL

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate required fields
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.startupName.trim()) errors.startupName = 'Startup name is required';

    // Validate email format (if provided)
    if (form.linkedInProfile && !form.linkedInProfile.includes('linkedin.com')) {
      errors.linkedInProfile = 'LinkedIn profile must be a valid URL';
    }

    // Validate website URL (if provided)
    if (form.companyWebsite) {
      try {
        new URL(form.companyWebsite);
      } catch {
        errors.companyWebsite = 'Website must be a valid URL (e.g., https://example.com)';
      }
    }

    // Validate phone number (if provided)
    if (form.phoneNumber && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(form.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    // Validate team members (if provided)
    if (form.numberOfTeamMembers && (isNaN(Number(form.numberOfTeamMembers)) || Number(form.numberOfTeamMembers) < 0)) {
      errors.numberOfTeamMembers = 'Số thành viên phải là số dương';
    }

    // Validate file upload
    if (profilePictureFile) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

      if (profilePictureFile.size > maxSize) {
        errors.profilePicture = 'Profile image must not exceed 2MB';
      } else if (!allowedTypes.includes(profilePictureFile.type)) {
        errors.profilePicture = 'Only image files (JPG, PNG, GIF) are accepted';
      }
    }

    return errors;
  };

  const onSave = () => {
    if (!user?.id) return;

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      message.error('Please check the information and fix the errors below');
      return;
    }

    // Clear validation errors if form is valid
    setValidationErrors({});

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('phoneNumber', form.phoneNumber || '');
    formData.append('linkedInProfile', form.linkedInProfile || '');
    formData.append('companyWebsite', form.companyWebsite || '');
    formData.append('startupName', form.startupName || '');
    formData.append('industryCategory', form.industryCategory || '');
    formData.append('fundingStage', form.fundingStage || '');
    formData.append('location', form.location || '');
    formData.append('numberOfTeamMembers', form.numberOfTeamMembers || '');
    formData.append('aboutUs', form.aboutUs || '');

    if (profilePictureFile) {
      formData.append('profilePictureUrl', profilePictureFile);
    }

    message.loading({ content: 'Saving...', key: 'profile', duration: 0 })
      ; (dispatch(updateStartupProfile({
        accountId: user.id,
        profileData: formData
      }) as any))
        .unwrap()
        .then(() => {
          message.success({ content: 'Profile saved successfully', key: 'profile' })
        })
        .catch((err: any) => {
          message.error({ content: err?.message || 'Save failed', key: 'profile' })
        })
  };

  return (
    <div style={{ padding: 32, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 900, margin: "0 auto" }}>
        {/* Personal Information */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            <UserOutlined /> Personal Information
          </h3>

          <div style={gridStyle}>
            <Input placeholder="Full Name *" value={form.fullName} onChange={onChange("fullName")} error={validationErrors.fullName} />
            <Input placeholder="Email Address" value={user?.email || ""} disabled />
            <Input placeholder="Phone Number" value={form.phoneNumber} onChange={onChange("phoneNumber")} error={validationErrors.phoneNumber} />
            <Input placeholder="Role" value={user?.role || ""} disabled />
            <Input placeholder="LinkedIn Profile" value={form.linkedInProfile} onChange={onChange("linkedInProfile")} error={validationErrors.linkedInProfile} />
            <Input placeholder="Company Website" value={form.companyWebsite} onChange={onChange("companyWebsite")} error={validationErrors.companyWebsite} />
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
            {/* Avatar */}
            {form.profilePictureUrl ? (
              <img src={form.profilePictureUrl} alt="avatar" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={avatarStyle}>{initials}</div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>Profile Picture</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>JPG, PNG or GIF (max. 2MB)</div>
              </div>

              <div>
                <label htmlFor="upload-input" style={{ display: 'inline-block', padding: '8px 12px', borderRadius: 12, background: '#fff', border: '1px solid #e6e6f0', cursor: 'pointer' }}>Upload New</label>
                <input
                  id="upload-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProfilePictureFile(file);
                    if (file) {
                      // Preview the image
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setForm(prev => ({ ...prev, profilePictureUrl: e.target?.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            {validationErrors.profilePicture && (
              <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>
                {validationErrors.profilePicture}
              </div>
            )}
          </div>




          <div style={{ textAlign: "right", marginTop: 24 }}>
            <button style={{ ...saveBtnStyle, opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={onSave}>{loading ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>

        {/* Startup / Company Information */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            <BankOutlined /> Startup / Company Information
          </h3>

          <div style={gridStyle}>
            <Input placeholder="Startup Name *" value={form.startupName} onChange={onChange("startupName")} error={validationErrors.startupName} />
            <Input placeholder="Industry Category" value={form.industryCategory} onChange={onChange("industryCategory")} />
            <Input placeholder="Funding Stage" value={form.fundingStage} onChange={onChange("fundingStage")} />
            <Input placeholder="Location" value={form.location} onChange={onChange("location")} />
            <Input placeholder="Number of Team Members" type="number" value={form.numberOfTeamMembers} onChange={onChange("numberOfTeamMembers")} error={validationErrors.numberOfTeamMembers} />
            <Input placeholder="Company Logo URL" value={form.companyLogo} onChange={onChange("companyLogo")} />
          </div>

          <textarea placeholder="About Us" value={form.aboutUs} onChange={onChange("aboutUs")} style={{ ...inputStyle, minHeight: 100, marginTop: 16, width: "100%" }} />

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <button style={{ ...saveBtnStyle, opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={onSave}>{loading ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Input
const Input: React.FC<{
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
  error?: string;
}> = ({ placeholder, value, onChange, disabled, type, error }) => (
  <div>
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      type={type}
      style={{
        ...inputStyle,
        borderColor: error ? '#ef4444' : '#d1d5db'
      }}
    />
    {error && (
      <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
        {error}
      </div>
    )}
  </div>
);

// Reusable Select
// Removed select for BE-aligned free text fields

// Shared styles
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
};

const cardTitleStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 24,
  fontSize: 18,
  fontWeight: 600,
  color: "#1e40af",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  fontSize: 14,
  outline: "none",
};

const avatarStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: "#3b82f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: 600,
  fontSize: 20,
};



const saveBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
};

export default Profile;
