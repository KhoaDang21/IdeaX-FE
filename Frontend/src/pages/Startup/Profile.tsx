import React from "react";
import { UploadOutlined, UserOutlined, BankOutlined } from "@ant-design/icons";

const Profile: React.FC = () => {
  return (
    <div style={{ padding: 32, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 900, margin: "0 auto" }}>
        {/* Personal Information */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            <UserOutlined /> Personal Information
          </h3>

          <div style={gridStyle}>
            <Input placeholder="Full Name *" />
            <Input placeholder="Email Address" />
            <Input placeholder="Phone Number" />
            <Input placeholder="Role" />
            <Input placeholder="LinkedIn Profile" />
            <Input placeholder="Company Website" />
          </div>

          {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
        {/* Avatar */}
        <div style={avatarStyle}>JS</div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 14, color: "#1e3a8a", fontWeight: 500 }}>
                Profile Picture
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
                JPG, PNG or GIF (max. 2MB)
            </div>
            </div>
            <button style={uploadBtnStyle}>Upload New</button>
        </div>
        </div>




          <div style={{ textAlign: "right", marginTop: 24 }}>
            <button style={saveBtnStyle}>Save Changes</button>
          </div>
        </div>

        {/* Startup / Company Information */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            <BankOutlined /> Startup / Company Information
          </h3>

          <div style={gridStyle}>
            <Input placeholder="Startup Name *" />
            <Select options={["Technology", "Finance", "Healthcare"]} />
            <Select options={["Series A", "Series B", "Seed"]} />
            <Input placeholder="Location" />
            <Input placeholder="Number of Team Members" />
          </div>

          <textarea placeholder="About Us" style={{ ...inputStyle, minHeight: 100, marginTop: 16, width: "100%" }} />

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <button style={saveBtnStyle}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Input
const Input: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <input placeholder={placeholder} style={inputStyle} />
);

// Reusable Select
const Select: React.FC<{ options: string[] }> = ({ options }) => (
  <select style={inputStyle}>
    {options.map((opt, i) => (
      <option key={i}>{opt}</option>
    ))}
  </select>
);

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

const uploadBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#f9fafb",
  cursor: "pointer",
  marginLeft: "auto",
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
