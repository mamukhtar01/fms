"use client";

import type { FirearmCondition, FirearmOwnershipType, FirearmStatus, Personnel } from "@/types/domain";
import { useQuery } from "@tanstack/react-query";
import { App, Button, Col, DatePicker, Form, Input, Modal, Row, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

interface RegisterFirearmModalProps {
  open: boolean;
  onCancel: () => void;
  onSaved: () => Promise<void> | void;
}

interface RegisterFirearmFormValues {
  weaponType: string;
  model: string;
  serialNumber: string;
  manufacturer?: string;
  caliber?: string;
  registrationNumber?: string;
  assetTag?: string;
  ownershipType: FirearmOwnershipType;
  ownerId?: string;
  status: FirearmStatus;
  condition: FirearmCondition;
  dateAcquired?: Dayjs;
  notes?: string;
  remarks?: string;
}

const weaponTypes = ["Rifle", "Pistol", "Shotgun", "Machine Gun", "Other"];
const ownershipTypes: { value: FirearmOwnershipType; label: string }[] = [
  { value: "sibc", label: "SIBC" },
  { value: "person", label: "Personal" },
];
const statusOptions: FirearmStatus[] = ["Available", "Assigned", "Under Maintenance", "Retired"];
const conditionOptions: FirearmCondition[] = ["Good", "New", "Damaged"];

export function RegisterFirearmModal({ open, onCancel, onSaved }: RegisterFirearmModalProps) {
  const [form] = Form.useForm<RegisterFirearmFormValues>();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const ownershipType = Form.useWatch("ownershipType", form);

  const { data: personnel = [], isLoading: loadingPersonnel } = useQuery<Personnel[]>({
    queryKey: ["personnel", "picker"],
    queryFn: async () => {
      const response = await fetch("/api/personnel", { cache: "no-store", credentials: "include" });
      const payload = (await response.json()) as { items?: Personnel[]; message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to load personnel");
      }
      return payload.items ?? [];
    },
    enabled: open && ownershipType === "person",
    retry: false,
  });

  useEffect(() => {
    if (ownershipType !== "person") {
      form.setFieldValue("ownerId", undefined);
    }
  }, [ownershipType, form]);

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
          ownershipType: "sibc",
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
            <Form.Item label="Manufacturer" name="manufacturer">
              <Input placeholder="e.g. Kalashnikov" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Caliber" name="caliber">
              <Input placeholder="e.g. 7.62x39" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Registration Number" name="registrationNumber">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Asset Tag" name="assetTag">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Ownership Type" name="ownershipType" rules={[{ required: true, message: "Select ownership type" }]}>
              <Select options={ownershipTypes} />
            </Form.Item>
          </Col>
          {ownershipType === "person" ? (
            <Col xs={24} md={12}>
              <Form.Item
                label="Owner"
                name="ownerId"
                rules={[{ required: true, message: "Select the owner" }]}
              >
                <Select
                  showSearch
                  loading={loadingPersonnel}
                  placeholder="Select personnel"
                  optionFilterProp="label"
                  options={personnel.map((person) => ({
                    value: person.id,
                    label: person.personnelId
                      ? `${person.fullName} (${person.personnelId})`
                      : person.fullName,
                  }))}
                  notFoundContent={loadingPersonnel ? "Loading personnel…" : "No personnel found"}
                />
              </Form.Item>
            </Col>
          ) : null}
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
          <Col xs={24} md={12}>
            <Form.Item label="Notes" name="notes">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Remarks" name="remarks">
              <Input.TextArea rows={2} />
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
