"use client";

import type { PersonnelStatus } from "@/types/domain";
import { App, Button, Col, Form, Input, Modal, Row, Select } from "antd";
import { useState } from "react";

interface AddPersonnelModalProps {
  open: boolean;
  onCancel: () => void;
  onSaved: () => Promise<void> | void;
}

interface AddPersonnelFormValues {
  personnelId: string;
  fullName: string;
  rank: string;
  position: string;
  department: string;
  phone: string;
  nationalId?: string;
  status: PersonnelStatus;
}

const statusOptions: PersonnelStatus[] = ["Active", "Inactive"];

export function AddPersonnelModal({ open, onCancel, onSaved }: AddPersonnelModalProps) {
  const [form] = Form.useForm<AddPersonnelFormValues>();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: AddPersonnelFormValues) {
    setSubmitting(true);

    try {
      const response = await fetch("/api/personnel", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to save personnel");
      }

      message.success("Personnel saved successfully");
      form.resetFields();
      onCancel();
      await onSaved();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to save personnel");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Add Personnel"
      open={open}
      onCancel={onCancel}
      width={720}
      footer={null}
      destroyOnHidden
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: "Active" as PersonnelStatus }}
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Personnel ID"
              name="personnelId"
              rules={[{ required: true, message: "Enter personnel ID" }]}
            >
              <Input placeholder="e.g. PER-003" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: "Enter full name" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Rank" name="rank" rules={[{ required: true, message: "Enter rank" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Position"
              name="position"
              rules={[{ required: true, message: "Enter position" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true, message: "Enter department" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[{ required: true, message: "Enter phone number" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="National ID" name="nationalId">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Status" name="status" rules={[{ required: true, message: "Select status" }]}>
              <Select options={statusOptions.map((value) => ({ value }))} />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" gutter={8}>
          <Col>
            <Button onClick={onCancel}>Cancel</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Save Personnel
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
