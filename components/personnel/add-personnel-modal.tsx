"use client";

import { createPersonnel, updatePersonnel, type PersonnelPayload } from "@/lib/services/personnel";
import type { Personnel, PersonnelStatus } from "@/types/domain";
import { App, Button, Col, Form, Input, Modal, Row, Select } from "antd";
import { useEffect, useState } from "react";

interface AddPersonnelModalProps {
  open: boolean;
  onCancel: () => void;
  onSaved: () => Promise<void> | void;
  personnel?: Personnel;
}

type AddPersonnelFormValues = PersonnelPayload;

const statusOptions: PersonnelStatus[] = ["Active", "Inactive"];

export function AddPersonnelModal({ open, onCancel, onSaved, personnel }: AddPersonnelModalProps) {
  const [form] = Form.useForm<AddPersonnelFormValues>();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (personnel) {
        form.setFieldsValue({
          personnelId: personnel.personnelId,
          fullName: personnel.fullName,
          rank: personnel.rank,
          position: personnel.position,
          department: personnel.department,
          phone: personnel.phone,
          nationalId: personnel.nationalId,
          status: personnel.status,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, personnel, form]);

  async function handleSubmit(values: AddPersonnelFormValues) {
    setSubmitting(true);

    try {
      if (personnel) {
        await updatePersonnel(personnel.id, values);
      } else {
        await createPersonnel(values);
      }
      message.success(personnel ? "Personnel updated successfully" : "Personnel saved successfully");
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
      title={personnel ? "Edit Personnel" : "Add Personnel"}
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
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Select status" }]}
            >
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
              {personnel ? "Save Changes" : "Save Personnel"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
