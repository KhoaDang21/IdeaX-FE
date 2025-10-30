import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Space, Button } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import type { MeetingFormData } from "../../interfaces/meeting";
import type { Project } from "../../interfaces/project";
import type { Dayjs } from "dayjs";

interface ScheduleMeetingModalProps {
  open: boolean;
  project: Project | null;
  onCancel: () => void;
  onCreate: (values: MeetingFormData & { meetingTime: Dayjs }) => void;
  loading: boolean;
}

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  open,
  project,
  onCancel,
  onCreate,
  loading,
}) => {
  const [form] = Form.useForm<MeetingFormData & { meetingTime: Dayjs }>();

  // Reset form và set giá trị initial khi modal được mở hoặc dự án thay đổi
  useEffect(() => {
    if (open && project) {
      form.setFieldsValue({
        topic: `Introduction: ${project.projectName}`,
        meetingTime: null,
        description: "",
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, project, form]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      onCreate(values);
    } catch (err) {
      console.log("Validation Failed:", err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <Space>
          <VideoCameraOutlined style={{ color: "#667eea" }} />
          <span>Create Meeting Room</span>
        </Space>
      }
      footer={[
        <Button key="cancel" onClick={handleCancel} size="large">
          Cancel
        </Button>,
        <Button
          key="create"
          type="primary"
          onClick={handleCreate}
          size="large"
          loading={loading} // Thêm loading state
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          Create Room
        </Button>,
      ]}
      width={520}
      centered
      zIndex={1001} // Thêm zIndex cao hơn modal detail
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="topic"
          label="Meeting Topic"
          rules={[{ required: true, message: "Please input meeting topic" }]}
        >
          <Input size="large" placeholder="Enter meeting topic..." />
        </Form.Item>

        <Form.Item
          name="meetingTime"
          label="Meeting Time"
          rules={[{ required: true, message: "Please select meeting time" }]}
        >
          <DatePicker
            showTime={{
              format: "HH:mm",
              minuteStep: 15,
              showNow: true,
            }}
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
            size="large"
            disabledDate={(current) => {
              return current && current.valueOf() < Date.now();
            }}
            placeholder="Select date and time"
          />
        </Form.Item>

        <Form.Item name="description" label="Additional Notes">
          <Input.TextArea
            rows={4}
            placeholder="Enter any additional information about the meeting..."
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ScheduleMeetingModal;
