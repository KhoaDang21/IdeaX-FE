import React, { useState } from "react";
import { SearchOutlined, CheckOutlined, FileOutlined } from "@ant-design/icons";

const Roommeet: React.FC = () => {
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState([
    { label: "NDA signed", checked: true },
    { label: "Proposal sent", checked: true },
    { label: "Investment terms agreed", checked: false },
  ]);

  const handleCheckboxChange = (index: number) => {
    const updatedProgress = progress.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    setProgress(updatedProgress);
  };

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ display: "flex", gap: 24 }}>
        {/* Left Sidebar */}
        <div
          style={{
            flex: 1,
            maxWidth: 300,
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: 20}}>
            Your Rooms
          </h3>
          <div style={{ position: "relative", marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Search by project or investor..."
              style={{
                width: "100%",
                padding: "8px 32px 8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#fff",
              }}
            />
            <SearchOutlined
              style={{ position: "absolute", right: 12, top: 10, color: "#64748b" }}
            />
          </div>
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 6,
              height: 40,
              background: "#f9fafb",
              marginBottom: 8,
            }}
          />
          
        </div>

        {/* Right Content */}
        <div style={{ flex: 3 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>
            AI-Powered Analytics Platform – Sarah Wilson
          </h2>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
          >
            <span style={{ fontSize: 14, marginRight: 8 }}>Deal Status:</span>
            <span
              style={{
                fontSize: 12,
                background: "#eff6ff",
                color: "#3b82f6",
                padding: "4px 12px",
                borderRadius: 999,
                marginRight: 8,
              }}
            >
              Under NDA
            </span>
            <button
              style={{
                fontSize: 12,
                background: "transparent",
                color: "#3b82f6",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FileOutlined style={{ marginRight: 4 }} /> Download NDA
            </button>
          </div>
          <hr
            style={{
              border: 0,
              height: 1,
              background: "#d1d5db",
              marginBottom: 16,
            }}
          />

          {/* Message History */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Message History</h3>
            <div
              style={{
                height: 100,
                background: "#f9fafb",
                borderRadius: 8,
                marginBottom: 12,
              }}
            ></div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                }}
              />
              <button
                style={{
                  padding: "8px 16px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Shared Files */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16 }}>Shared Files</h3>
              <button
                style={{
                  padding: "8px 16px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Upload File
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f9fafb",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              <span style={{ color: "#64748b" }}>. . .</span>
              <button
                style={{
                  background: "transparent",
                  color: "#64748b",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Download
              </button>
            </div>
          </div>

          {/* Deal Progress */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Deal Progress</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {progress.map((item, index) => (
                <li
                  key={index}
                  style={{ marginBottom: 8, display: "flex", alignItems: "center" }}
                >
                  <span
                    style={{
                      marginRight: 8,
                      display: "inline-block",
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: item.checked ? "#dcfce7" : "#e5e7eb",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onClick={() => handleCheckboxChange(index)}
                  >
                    {item.checked && (
                      <CheckOutlined
                        style={{
                          color: "#16a34a",
                          position: "absolute",
                          top: 2,
                          left: 2,
                          fontSize: 16,
                        }}
                      />
                    )}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
            <button
              style={{
                width: "100%",
                marginTop: 16,
                padding: "8px",
                background: "#e5e7eb",
                color: "#64748b",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Mark Deal As Closed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roommeet;
