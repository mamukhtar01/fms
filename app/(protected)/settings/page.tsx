"use client";

import { Button, Card, Col, Form, InputNumber, Row, Switch } from "antd";

export default function SettingsPage() {
  return (
    <Card title="System Settings">
      <Form layout="vertical" initialValues={{ overdueDays: 7, darkMode: false, notifications: true }}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Overdue Alert Threshold (days)" name="overdueDays">
              <InputNumber min={1} max={90} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Enable Dark Mode" name="darkMode" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Enable Notifications" name="notifications" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary">Save Settings</Button>
      </Form>
    </Card>
  );
}
