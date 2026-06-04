"use client";

import type { FirearmCondition, FirearmStatus } from "@/types/domain";
import { App, Button, Col, DatePicker, Form, Input, Modal, Row, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useState } from "react";

interface RegisterFirearmModalProps {
  open: boolean;
  onCancel: () => void;
  onSaved: () => Promise<void> | void;
}

interface RegisterFirearmFormValues {
  weaponType: string;
  weaponName: string;
  model: string;
  serialNumber: string;
  ownershipType: "Company-Owned" | "Personally-Owned";
  ownerName: string;
  currentLocation: string;
  status: FirearmStatus;
  condition: FirearmCondition;
  dateAcquired?: Dayjs;
}

const weaponTypes = ["Rifle", "Pistol", "Shotgun", "Machine Gun", "Other"];
const ownershipTypes: RegisterFirearmFormValues["ownershipType"][] = ["Company-Owned", "Personally-Owned"];
const statusOptions: FirearmStatus[] = ["Available", "Assigned", "Under Maintenance", "Lost", "Retired"];
const conditionOptions: FirearmCondition[] = ["Excellent", "Good", "Fair", "Damaged"];

export function RegisterFirearmModal({ open, onCancel, onSaved }: RegisterFirearmModalProps) {
  const [form] = Form.useForm<RegisterFirearmFormValues>();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: RegisterFirearmFormValues) {
    setSubmitting(true);

    try {
      const response = await fetch("/api/firearms", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dateAcquired: values.dateAcquired?.format("YYYY-MM-DD"),
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to save firearm");
      }

      message.success("Firearm registered successfully");
      form.resetFields();
      onCancel();
      await onSaved();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to save firearm");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Register New Firearm"
      open={open}
      onCancel={onCancel}
      width={860}
      footer={null}
      destroyOnHidden
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "Available",
          condition: "Good",
          ownershipType: "Company-Owned",
          dateAcquired: dayjs(),
        }}
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Weapon Type" name="weaponType" rules={[{ required: true, message: "Select weapon type" }]}>
              <Select options={weaponTypes.map((value) => ({ value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Weapon Name" name="weaponName" rules={[{ required: true, message: "Enter weapon name" }]}>
              <Input placeholder="e.g. AK Platform" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Model" name="model" rules={[{ required: true, message: "Enter model" }]}>
              <Input placeholder="e.g. AK-103" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Serial Number" name="serialNumber" rules={[{ required: true, message: "Enter serial number" }]}>
              <Input placeholder="e.g. AK103-778901" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Ownership Type" name="ownershipType" rules={[{ required: true, message: "Select ownership type" }]}>
              <Select options={ownershipTypes.map((value) => ({ value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Owner Name" name="ownerName" rules={[{ required: true, message: "Enter owner name" }]}>
              <Input placeholder="e.g. SIBC / Officer Name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Current Location" name="currentLocation" rules={[{ required: true, message: "Enter location" }]}>
              <Input placeholder="e.g. Main Armoury" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Status" name="status" rules={[{ required: true, message: "Select status" }]}>
              <Select options={statusOptions.map((value) => ({ value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Condition" name="condition" rules={[{ required: true, message: "Select condition" }]}>
              <Select options={conditionOptions.map((value) => ({ value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Date Acquired" name="dateAcquired">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" gutter={8}>
          <Col>
            <Button onClick={onCancel}>Cancel</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Save Firearm
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
