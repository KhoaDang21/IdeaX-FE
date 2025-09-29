import React, { useEffect, useMemo, useState } from "react";
import { UserOutlined, BankOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { getStartupProfile, updateStartupProfile } from "../../services/features/auth/authSlice";
import { api } from "../../services/constant/axiosInstance";
import { BASE_URL, STARTUP_PROFILE_UPLOAD_ENDPOINT } from "../../services/constant/apiConfig";
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
  const handleFileUpload = async (f?: File) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/gif"];
    const maxBytes = 2 * 1024 * 1024;
    if (!allowed.includes(f.type)) {
      message.error('Only JPG/PNG/GIF allowed');
      return;
    }
    if (f.size > maxBytes) {
      message.error('File too large (max 2MB)');
      return;
    }

    // Build form data and upload
    const formData = new FormData();
    formData.append('file', f, f.name);
    try {
      message.loading({ content: 'Uploading image...', key: 'upload', duration: 0 });
      if (!user?.id) throw new Error('User not found');
      const resp = await api.upload<any>(STARTUP_PROFILE_UPLOAD_ENDPOINT(user.id), formData);
      const data = resp.data;
      // backend returns updated StartupProfile entity (or fallback to path)
      let url = '';
      if (typeof data === 'string') {
        url = data.startsWith('http') ? data : `${BASE_URL}${data}`;
        setForm(prev => ({ ...prev, profilePictureUrl: url }));
      } else if (data && data.profilePictureUrl) {
        url = data.profilePictureUrl.startsWith('http') ? data.profilePictureUrl : `${BASE_URL}${data.profilePictureUrl}`;
        setForm(prev => ({ ...prev, profilePictureUrl: url }));
      }

      // Refresh profile in store so header/sidebar update
      try { (dispatch(getStartupProfile(user.id) as any)); } catch (e) { /* ignore */ }

      message.success({ content: 'Upload thành công', key: 'upload' });
    } catch (err: any) {
      const status = err?.response?.status;
      const text = err?.response?.data || err?.message || 'Upload thất bại';
      message.error({ content: `Lỗi upload${status ? ' (status ' + status + ')' : ''}: ${text}`, key: 'upload' });
    }
  };

  const onSave = () => {
    if (!user?.id) return;
    message.loading({ content: 'Đang lưu...', key: 'profile', duration: 0 })
      ; (dispatch(updateStartupProfile({
        accountId: user.id,
        profileData: {
          fullName: form.fullName,
          phoneNumber: form.phoneNumber || undefined,
          linkedInProfile: form.linkedInProfile || undefined,
          companyWebsite: form.companyWebsite || undefined,
          profilePictureUrl: form.profilePictureUrl || undefined,
          companyLogo: form.companyLogo || undefined,
          startupName: form.startupName || undefined,
          industryCategory: form.industryCategory || undefined,
          fundingStage: form.fundingStage || undefined,
          location: form.location || undefined,
          numberOfTeamMembers: form.numberOfTeamMembers ? Number(form.numberOfTeamMembers) : undefined,
          aboutUs: form.aboutUs || undefined,
        }
      }) as any))
        .unwrap()
        .then(() => {
          message.success({ content: 'Lưu profile thành công', key: 'profile' })
        })
        .catch((err: any) => {
          message.error({ content: err?.message || 'Lưu thất bại', key: 'profile' })
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
            <Input placeholder="Full Name *" value={form.fullName} onChange={onChange("fullName")} />
            <Input placeholder="Email Address" value={user?.email || ""} disabled />
            <Input placeholder="Phone Number" value={form.phoneNumber} onChange={onChange("phoneNumber")} />
            <Input placeholder="Role" value={user?.role || ""} disabled />
            <Input placeholder="LinkedIn Profile" value={form.linkedInProfile} onChange={onChange("linkedInProfile")} />
            <Input placeholder="Company Website" value={form.companyWebsite} onChange={onChange("companyWebsite")} />
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
                <input id="upload-input" type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files ? e.target.files[0] : undefined)} style={{ display: 'none' }} />
              </div>
            </div>
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
            <Input placeholder="Startup Name *" value={form.startupName} onChange={onChange("startupName")} />
            <Input placeholder="Industry Category" value={form.industryCategory} onChange={onChange("industryCategory")} />
            <Input placeholder="Funding Stage" value={form.fundingStage} onChange={onChange("fundingStage")} />
            <Input placeholder="Location" value={form.location} onChange={onChange("location")} />
            <Input placeholder="Number of Team Members" type="number" value={form.numberOfTeamMembers} onChange={onChange("numberOfTeamMembers")} />
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
const Input: React.FC<{ placeholder: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; type?: string }> = ({ placeholder, value, onChange, disabled, type }) => (
  <input placeholder={placeholder} style={inputStyle} value={value} onChange={onChange} disabled={disabled} type={type}
  />
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
