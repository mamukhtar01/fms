"use client";

import { canManageUsers } from "@/lib/access-control";
import { getUsers } from "@/lib/services/users";
import type { User } from "@/types/domain";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Tag, Table } from "antd";
import type { TableColumnsType } from "antd";

export default function UsersPage() {
  const isAdmin = canManageUsers();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isAdmin,
    retry: false,
  });

  if (!isAdmin) {
    return (
      <Alert
        type="error"
        showIcon
        message="Access denied"
        description="Only administrators can access user management."
      />
    );
  }

  const columns: TableColumnsType<User> = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Role",
      dataIndex: "role",
      render: (role: string) => (
        <Tag color={role === "ADMIN" ? "red" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Verified",
      dataIndex: "verified",
      render: (verified: boolean) => (
        <Tag color={verified ? "success" : "default"}>{verified ? "Yes" : "No"}</Tag>
      ),
    },
  ];

  return (
    <Card title="User Management">
      <Table<User>
        rowKey="id"
        loading={isLoading}
        dataSource={users}
        columns={columns}
        pagination={false}
      />
    </Card>
  );
}
