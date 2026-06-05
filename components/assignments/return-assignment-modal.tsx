"use client";

import type { FirearmAssignment } from "@/types/domain";
import { App, Button, Col, Form, Input, InputNumber, Modal, Row, Select, Descriptions } from "antd";
import { useEffect, useState } from "react";

interface ReturnAssignmentModalProps {
  assignment: FirearmAssignment | null;
  open: boolean;
  onCancel: () => void;
  onSaved: () => Promise<void> | void;
}

interface ReturnAssignmentFormValues {
  returnCondition: string;
  quantityReturned?: number;
  quantityExpended?: number;
  quantityMissing?: number;
  remarks?: string;
}

const conditionOptions = ["Excellent", "Good", "Fair", "Damaged"];

export function ReturnAssignmentModal({ assignment, open, onCancel, onSaved }: ReturnAssignmentModalProps) {
  const [form] = Form.useForm<ReturnAssignmentFormValues>();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  // Watch fields for ammunition calculation and validation
  const qtyReturned = Form.useWatch("quantityReturned", form) ?? 0;
  const qtyExpended = Form.useWatch("quantityExpended", form) ?? 0;
  const qtyMissing = Form.useWatch("quantityMissing", form) ?? 0;

  const totalAccounted = qtyReturned + qtyExpended + qtyMissing;
  const hasAmmunition = !!(assignment?.quantityIssued && assignment.quantityIssued > 0);
  const issuedQty = assignment?.quantityIssued ?? 0;

  useEffect(() => {
    if (open && assignment) {
      form.setFieldsValue({
        returnCondition: assignment.issueCondition || "Good",
        quantityReturned: assignment.quantityIssued ?? 0,
        quantityExpended: 0,
        quantityMissing: 0,
        remarks: "",
      });
    }
  }, [open, assignment, form]);

  async function handleSubmit(values: ReturnAssignmentFormValues) {
    if (!assignment) return;

    // Ammunition check validation
    if (hasAmmunition) {
      if (totalAccounted !== issuedQty) {
        message.error(`Ammunition mismatch: Accounted rounds (${totalAccounted}) must equal Issued rounds (${issuedQty})`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/assignments/${assignment.id}/return`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to process return");
      }

      message.success("Firearm return processed successfully");
      form.resetFields();
      onCancel();
      await onSaved();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to process return");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Process Firearm Return"
      open={open}
      onCancel={onCancel}
      width={640}
      footer={null}
      destroyOnClose
      centered
    >
      {assignment ? (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <Descriptions title="Assignment Information" bordered size="small" column={1}>
              <Descriptions.Item label="Assignment No.">{assignment.id}</Descriptions.Item>
              <Descriptions.Item label="Firearm">{`${assignment.firearmCode} (${assignment.firearmModel} - ${assignment.firearmSerial})`}</Descriptions.Item>
              <Descriptions.Item label="Officer">{assignment.officerName}</Descriptions.Item>
              <Descriptions.Item label="Assigned By">{assignment.assignedByName}</Descriptions.Item>
              <Descriptions.Item label="Condition on Issue">{assignment.issueCondition}</Descriptions.Item>
            </Descriptions>
          </div>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Return Condition"
                name="returnCondition"
                rules={[{ required: true, message: "Please select return condition" }]}
              >
                <Select options={conditionOptions.map((value) => ({ value }))} />
              </Form.Item>
            </Col>

            {hasAmmunition ? (
              <>
                {/* Ammunition details header */}
                <Col xs={24} style={{ marginTop: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, borderBottom: "1px solid #f0f0f0", paddingBottom: 6 }}>
                    Ammunition Accounting (Issued: {issuedQty} rounds of {assignment.ammunitionType})
                  </div>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Qty Returned"
                    name="quantityReturned"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber min={0} max={issuedQty} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Qty Expended"
                    name="quantityExpended"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber min={0} max={issuedQty} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Qty Missing"
                    name="quantityMissing"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber min={0} max={issuedQty} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col xs={24} style={{ marginBottom: 12 }}>
                  <div style={{
                    padding: "8px 12px",
                    borderRadius: 4,
                    background: totalAccounted === issuedQty ? "#f6ffed" : "#fff2f0",
                    border: totalAccounted === issuedQty ? "1px solid #b7eb8f" : "1px solid #ffccc7",
                    color: totalAccounted === issuedQty ? "#389e0d" : "#ff4d4f",
                    fontSize: 13,
                    textAlign: "center"
                  }}>
                    {totalAccounted === issuedQty
                      ? `All ${issuedQty} rounds accounted for.`
                      : `Ammunition mismatch: Accounted rounds sum to ${totalAccounted} (must equal ${issuedQty} issued).`}
                  </div>
                </Col>
              </>
            ) : null}

            <Col xs={24}>
              <Form.Item label="Return Remarks / Notes" name="remarks">
                <Input.TextArea rows={3} placeholder="Notes on returned weapon condition, ammunition usage, etc…" />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" gutter={8} style={{ marginTop: 12 }}>
            <Col>
              <Button onClick={onCancel}>Cancel</Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={hasAmmunition && totalAccounted !== issuedQty}
              >
                Process Return
              </Button>
            </Col>
          </Row>
        </Form>
      ) : null}
    </Modal>
  );
}
