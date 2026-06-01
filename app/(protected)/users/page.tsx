import { canManageUsers } from "@/lib/access-control";
import { Alert, Card, Table } from "antd";

const users = [
  { id: "u1", name: "Admin User", email: "admin@sibc.local", role: "ADMIN" },
  { id: "u2", name: "Officer Fatima", email: "fatima@sibc.local", role: "OFFICER" },
];

export default async function UsersPage() {
  const isAdmin = await canManageUsers();

  if (!isAdmin) {
    return <Alert type="error" showIcon message="Access denied" description="Only administrators can access user management." />;
  }

  return (
    <Card title="User Management">
      <Table
        rowKey="id"
        dataSource={users}
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Email", dataIndex: "email" },
          { title: "Role", dataIndex: "role" },
        ]}
        pagination={false}
      />
    </Card>
  );
}
