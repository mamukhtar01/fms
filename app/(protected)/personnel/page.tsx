"use client";

import { personnel } from "@/data/mock";
import { Button, Card, Form, Input, Row, Col, Select, Table } from "antd";

export default function PersonnelPage() {
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title="Personnel Directory">
          <Table
            rowKey="id"
            dataSource={personnel}
            columns={[
              { title: "Personnel ID", dataIndex: "personnelId" },
              { title: "Full Name", dataIndex: "fullName" },
              { title: "Rank", dataIndex: "rank" },
              { title: "Position", dataIndex: "position" },
              { title: "Department", dataIndex: "department" },
              { title: "Phone", dataIndex: "phone" },
              { title: "Status", dataIndex: "status" },
            ]}
          />
        </Card>
      </Col>

      <Col span={24}>
        <Card title="Add Personnel">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Personnel ID" name="personnelId" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Rank" name="rank" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Department" name="department" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Phone Number" name="phone" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Status" name="status" initialValue="Active">
                  <Select options={[{ value: "Active" }, { value: "Inactive" }]} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary">Save Personnel</Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
