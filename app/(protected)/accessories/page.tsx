"use client";

import { Card, Table, Tag } from "antd";

const accessories = [
  { id: "ac1", accessoryCode: "MAG-001", name: "Magazine", category: "Magazine", status: "Assigned", currentLocation: "Airport Security" },
  { id: "ac2", accessoryCode: "SLN-019", name: "Sling", category: "Carry", status: "Available", currentLocation: "Main Armoury" },
  { id: "ac3", accessoryCode: "SCP-121", name: "Scope", category: "Optic", status: "Damaged", currentLocation: "Maintenance Workshop" },
];

export default function AccessoriesPage() {
  return (
    <Card title="Accessories & Equipment">
      <Table
        rowKey="id"
        dataSource={accessories}
        columns={[
          { title: "Code", dataIndex: "accessoryCode" },
          { title: "Name", dataIndex: "name" },
          { title: "Category", dataIndex: "category" },
          { title: "Location", dataIndex: "currentLocation" },
          {
            title: "Status",
            dataIndex: "status",
            render: (status: string) => (
              <Tag color={status === "Available" ? "green" : status === "Assigned" ? "gold" : "red"}>{status}</Tag>
            ),
          },
        ]}
      />
    </Card>
  );
}
