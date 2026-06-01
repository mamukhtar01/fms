"use client";

import { ammunitionDiscrepancies } from "@/data/mock";
import { Card, Table, Tag, Typography } from "antd";

export default function AmmunitionPage() {
  return (
    <Card title="Ammunition Transactions">
      <Table
        rowKey="key"
        dataSource={ammunitionDiscrepancies}
        columns={[
          { title: "Assignment", dataIndex: "assignmentNumber" },
          { title: "Type", dataIndex: "ammunitionType" },
          { title: "Issued", dataIndex: "quantityIssued" },
          { title: "Returned", dataIndex: "quantityReturned" },
          { title: "Expended", dataIndex: "quantityExpended" },
          {
            title: "Missing",
            dataIndex: "quantityMissing",
            render: (value: number) => <Tag color={value > 0 ? "red" : "green"}>{value}</Tag>,
          },
        ]}
      />
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        Validation rule: returned quantity cannot exceed issued quantity; missing ammunition generates discrepancy alerts.
      </Typography.Paragraph>
    </Card>
  );
}
