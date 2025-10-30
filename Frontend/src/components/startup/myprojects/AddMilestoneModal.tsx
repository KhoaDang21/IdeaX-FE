import type { FC } from "react";
import { Modal, Form, Input, DatePicker, Button } from "antd";
import type { FormInstance } from "antd/es/form";

interface Props {
  isOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  form: FormInstance;
}

export const AddMilestoneModal: FC<Props> = ({
  isOpen,
  onOk,
  onCancel,
  form,
}) => {
  return (
    <Modal
      title={
        <h3 style={{ color: "#1e3a8a", margin: 0 }}>Create New Milestone</h3>
      }
      open={isOpen}
      onOk={onOk}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ marginRight: 8 }}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={onOk}
          style={{ background: "#3b82f6", borderColor: "#3b82f6" }}
        >
          Add Milestone
        </Button>,
      ]}
      style={{ top: 20 }}
      width={400}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label={
            <span style={{ fontWeight: 500, color: "#374151" }}>Title</span>
          }
          rules={[{ required: true, message: "Please input the title!" }]}
          style={{ marginBottom: 16 }}
        >
          <Input
            placeholder="Enter milestone title"
            style={{ borderRadius: 6, padding: "6px 12px" }}
          />
        </Form.Item>
        <Form.Item
          name="description"
          label={
            <span style={{ fontWeight: 500, color: "#374151" }}>
              Description
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <Input.TextArea
            placeholder="Enter milestone description"
            autoSize={{ minRows: 3, maxRows: 5 }}
            style={{ borderRadius: 6, padding: "6px 12px" }}
          />
        </Form.Item>
        <Form.Item
          name="dueDate"
          label={
            <span style={{ fontWeight: 500, color: "#374151" }}>Due Date</span>
          }
          rules={[{ required: true, message: "Please select the due date!" }]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            style={{
              width: "100%",
              borderRadius: 6,
              padding: "6px 12px",
            }}
            placeholder="Select due date"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
