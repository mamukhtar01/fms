"use client";

import { Button, Card, Col, List, Row, Space, Typography, message } from "antd";

const reportTypes = [
  "Inventory Report",
  "Assignment Report",
  "Ammunition Report",
  "Accessory Report",
  "Ownership Report",
  "Chain of Custody Report",
  "Audit Report",
];

export default function ReportsPage() {
  function exportReport(type: string, format: "CSV" | "Excel" | "PDF") {
    message.success(`${type} exported as ${format}`);
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title="Reports & Exports">
          <List
            dataSource={reportTypes}
            renderItem={(report) => (
              <List.Item
                actions={[
                  <Space key="actions">
                    <Button onClick={() => exportReport(report, "CSV")}>CSV</Button>
                    <Button onClick={() => exportReport(report, "Excel")}>Excel</Button>
                    <Button type="primary" onClick={() => exportReport(report, "PDF")}>PDF</Button>
                  </Space>,
                ]}
              >
                <List.Item.Meta
                  title={report}
                  description="Includes filters for date range, ownership type, weapon type, location, and officer."
                />
              </List.Item>
            )}
          />
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Server-side export handlers can be implemented in route handlers with the same report contract.
          </Typography.Paragraph>
        </Card>
      </Col>
    </Row>
  );
}
