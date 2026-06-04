"use client";

import { assignments } from "@/data/mock";
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Table, Tabs, Tag } from "antd";

export default function AssignmentsPage() {
  return (
    <Tabs
      items={[
        {
          key: "active",
          label: "Active Assignments",
          children: (
            <Card>
              <Table
                rowKey="id"
                dataSource={assignments}
                columns={[
                  { title: "Assignment ID", dataIndex: "id" },
                  { title: "Firearm", dataIndex: "firearmId" },
                  { title: "Officer", dataIndex: "officerName" },
                  { title: "Assigned By", dataIndex: "assignedBy" },
                  {
                    title: "Status",
                    dataIndex: "status",
                    render: (status: string) => <Tag color={status === "Overdue" ? "red" : "blue"}>{status}</Tag>,
                  },
                ]}
              />
            </Card>
          ),
        },
        {
          key: "create",
          label: "Assign Firearm",
          children: (
            <Card>
              <Form layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Firearm" name="firearmId" rules={[{ required: true }]}>
                      <Input placeholder="RF-001" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Assigned Officer" name="officerId" rules={[{ required: true }]}>
                      <Input placeholder="PER-001" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Expected Return Date" name="expectedReturnDate" rules={[{ required: true }]}>
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Issue Condition" name="issueCondition" rules={[{ required: true }]}>
                      <Select options={["Excellent", "Good", "Damaged"].map((value) => ({ value }))} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Purpose" name="purpose" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Ammunition Type" name="ammunitionType">
                      <Input placeholder="e.g. 7.62mm" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Qty Issued" name="quantityIssued">
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Button type="primary">Create Assignment Transaction</Button>
              </Form>
            </Card>
          ),
        },
        {
          key: "return",
          label: "Return Firearm",
          children: (
            <Card>
              <Form layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Assignment Number" name="assignmentNumber" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Return Condition" name="returnCondition" rules={[{ required: true }]}>
                      <Select options={["Excellent", "Good", "Damaged"].map((value) => ({ value }))} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Quantity Returned" name="quantityReturned">
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Button type="primary">Process Return</Button>
              </Form>
            </Card>
          ),
        },
      ]}
    />
  );
}
