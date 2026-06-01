"use client";

import { Card, Table } from "antd";

const ownershipTransfers = [
  {
    id: "ot1",
    firearmId: "PS-014",
    previousOwner: "Officer Fatima",
    newOwner: "SIBC",
    transferDate: "2026-01-05",
    approvedBy: "Admin",
    reason: "Acquired for company inventory",
  },
  {
    id: "ot2",
    firearmId: "RF-009",
    previousOwner: "SIBC",
    newOwner: "Officer Ahmed",
    transferDate: "2026-02-18",
    approvedBy: "Admin",
    reason: "Authorized personal assignment",
  },
];

export default function OwnershipPage() {
  return (
    <Card title="Ownership Transfers">
      <Table
        rowKey="id"
        dataSource={ownershipTransfers}
        columns={[
          { title: "Firearm", dataIndex: "firearmId" },
          { title: "Previous Owner", dataIndex: "previousOwner" },
          { title: "New Owner", dataIndex: "newOwner" },
          { title: "Transfer Date", dataIndex: "transferDate" },
          { title: "Approved By", dataIndex: "approvedBy" },
          { title: "Reason", dataIndex: "reason" },
        ]}
      />
    </Card>
  );
}
