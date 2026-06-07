"use client";

import { createAssignment, type AssignmentCreatePayload } from "@/lib/services/assignments";
import { getFirearms } from "@/lib/services/firearms";
import { getPersonnelList } from "@/lib/services/personnel";
import type { Firearm, Personnel } from "@/types/domain";
import { useQuery } from "@tanstack/react-query";
import { App, Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useState } from "react";

interface IssueAssignmentModalProps {
  open: boolean;
  onCancel: () => void;
  onSaved: () => Promise<void> | void;
}

interface IssueAssignmentFormValues {
  firearmId: string;
  officerId: string;
  expectedReturnDate: Dayjs;
  issueCondition: string;
  purpose: string;
  remarks?: string;
  ammunitionType?: string;
  quantityIssued?: number;
}

const conditionOptions = ["Excellent", "Good", "Fair", "Damaged"];

export function IssueAssignmentModal({ open, onCancel, onSaved }: IssueAssignmentModalProps) {
  const [form] = Form.useForm<IssueAssignmentFormValues>();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  const { data: firearms = [], isLoading: loadingFirearms } = useQuery<Firearm[]>({
    queryKey: ["firearms", "picker-available"],
    queryFn: async () => {
      const items = await getFirearms();
      return items.filter((f) => f.status === "Available");
    },
    enabled: open,
    retry: false,
  });

  const { data: personnel = [], isLoading: loadingPersonnel } = useQuery<Personnel[]>({
    queryKey: ["personnel", "picker-active"],
    queryFn: async () => {
      const items = await getPersonnelList();
      return items.filter((p) => p.status === "Active");
    },
    enabled: open,
    retry: false,
  });

  async function handleSubmit(values: IssueAssignmentFormValues) {
    setSubmitting(true);

    try {
      const payload: AssignmentCreatePayload = {
        ...values,
        expectedReturnDate: values.expectedReturnDate.format("YYYY-MM-DD"),
      };
      await createAssignment(payload);
      message.success("Firearm assigned successfully");
      form.resetFields();
      onCancel();
      await onSaved();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Issue Firearm Assignment"
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
        initialValues={{
          issueCondition: "Good",
          expectedReturnDate: dayjs().add(7, "day"),
        }}
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Select Firearm"
              name="firearmId"
              rules={[{ required: true, message: "Please select a firearm" }]}
            >
              <Select
                showSearch
                loading={loadingFirearms}
                placeholder="Search firearm by ID, model, serial…"
                optionFilterProp="filterLabel"
                options={firearms.map((f) => ({
                  value: f.id,
                  label: `${f.firearmId} - ${f.model} (${f.serialNumber})`,
                  filterLabel: `${f.firearmId} ${f.model} ${f.serialNumber}`.toLowerCase(),
                }))}
                notFoundContent={loadingFirearms ? "Loading firearms…" : "No available firearms"}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Assign Officer"
              name="officerId"
              rules={[{ required: true, message: "Please select an officer" }]}
            >
              <Select
                showSearch
                loading={loadingPersonnel}
                placeholder="Search officer by ID, name, rank…"
                optionFilterProp="filterLabel"
                options={personnel.map((p) => ({
                  value: p.id,
                  label: `${p.fullName} (${p.personnelId}) - ${p.rank}`,
                  filterLabel: `${p.fullName} ${p.personnelId} ${p.rank}`.toLowerCase(),
                }))}
                notFoundContent={loadingPersonnel ? "Loading personnel…" : "No active officers"}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Expected Return Date"
              name="expectedReturnDate"
              rules={[{ required: true, message: "Please select expected return date" }]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Issue Condition"
              name="issueCondition"
              rules={[{ required: true, message: "Please select issue condition" }]}
            >
              <Select options={conditionOptions.map((value) => ({ value }))} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              label="Purpose"
              name="purpose"
              rules={[{ required: true, message: "Please enter purpose of assignment" }]}
            >
              <Input placeholder="e.g. Daily Patrol, Special Operations, Training Exercise" />
            </Form.Item>
          </Col>

          <Col xs={24} style={{ marginTop: 8, marginBottom: 8 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                borderBottom: "1px solid #f0f0f0",
                paddingBottom: 6,
              }}
            >
              Ammunition Issuance (Optional)
            </div>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Ammunition Type" name="ammunitionType">
              <Input placeholder="e.g. 7.62x39mm, 9mm NATO" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Quantity Issued" name="quantityIssued">
              <InputNumber min={0} placeholder="e.g. 30" style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} style={{ marginTop: 8 }}>
            <Form.Item label="Remarks / Notes" name="remarks">
              <Input.TextArea
                rows={3}
                placeholder="Additional notes about this assignment transaction…"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" gutter={8} style={{ marginTop: 12 }}>
          <Col>
            <Button onClick={onCancel}>Cancel</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Issue Assignment
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
