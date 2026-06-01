"use client";

import { firearms } from "@/data/mock";
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Table, Tag, Typography } from "antd";

export default function FirearmsPage() {
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title="Firearm Inventory">
          <Table
            rowKey="id"
            dataSource={firearms}
            columns={[
              { title: "Firearm ID", dataIndex: "firearmId" },
              { title: "Serial Number", dataIndex: "serialNumber" },
              { title: "Weapon", dataIndex: "weaponName" },
              { title: "Type", dataIndex: "weaponType" },
              { title: "Ownership", dataIndex: "ownershipType" },
              {
                title: "Status",
                dataIndex: "status",
                render: (status: string) => (
                  <Tag color={status === "Assigned" ? "gold" : status === "Available" ? "green" : "red"}>{status}</Tag>
                ),
              },
              { title: "Location", dataIndex: "currentLocation" },
            ]}
          />
        </Card>
      </Col>

      <Col span={24}>
        <Card title="Register Firearm">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Weapon Type" name="weaponType" rules={[{ required: true }]}>
                  <Select options={["Rifle", "Pistol", "Shotgun", "Machine Gun", "Other"].map((value) => ({ value }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Weapon Name" name="weaponName" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Model" name="model" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Serial Number" name="serialNumber" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Ownership Type" name="ownershipType" rules={[{ required: true }]}>
                  <Select options={["Company-Owned", "Personally-Owned"].map((value) => ({ value }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Date Acquired" name="dateAcquired" rules={[{ required: true }]}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary">Save Firearm</Button>
            <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
              Submission handlers should create firearm, ownership and movement entries atomically.
            </Typography.Paragraph>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
