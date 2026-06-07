"use client";

import { AddPersonnelModal } from "@/components/personnel/add-personnel-modal";
import { getPersonnelList } from "@/lib/services/personnel";
import type { Personnel, PersonnelStatus } from "@/types/domain";
import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const STATUS_COLORS: Record<PersonnelStatus, string> = {
  Active: "success",
  Inactive: "default",
};

export default function PersonnelPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: personnel = [],
    isFetching: loading,
    refetch,
    isError,
    error,
  } = useQuery<Personnel[]>({
    queryKey: ["personnel"],
    queryFn: getPersonnelList,
    retry: false,
  });

  const filteredPersonnel = useMemo(() => {
    const term = search.trim().toLowerCase();
    return personnel.filter((person) => {
      const statusMatch = statusFilter === "all" || person.status === statusFilter;
      const searchMatch =
        !term ||
        person.personnelId.toLowerCase().includes(term) ||
        person.fullName.toLowerCase().includes(term) ||
        person.rank.toLowerCase().includes(term) ||
        person.position.toLowerCase().includes(term) ||
        person.department.toLowerCase().includes(term) ||
        person.phone.toLowerCase().includes(term);

      return statusMatch && searchMatch;
    });
  }, [personnel, search, statusFilter]);

  const columns: TableColumnsType<Personnel> = [
    {
      title: "Personnel ID",
      dataIndex: "personnelId",
      width: 130,
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    { title: "Full Name", dataIndex: "fullName", width: 180, ellipsis: true },
    { title: "Rank", dataIndex: "rank", width: 120 },
    { title: "Position", dataIndex: "position", width: 140, ellipsis: true },
    { title: "Department", dataIndex: "department", width: 160, ellipsis: true },
    { title: "Phone", dataIndex: "phone", width: 150 },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      render: (status: PersonnelStatus) => (
        <Tag color={STATUS_COLORS[status] ?? "default"}>{status}</Tag>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Card styles={{ body: { padding: "24px 28px" } }}>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Personnel directory
            </Typography.Title>
          </div>
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={() => void refetch()} loading={loading}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsModalOpen(true)}
            >
              Add
            </Button>
          </Space>
        </Flex>
      </Card>

      {isError ? (
        <Alert
          type="error"
          showIcon
          title="Could not load personnel"
          description={error instanceof Error ? error.message : "Please try again."}
          action={
            <Button size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      <Card title={`Personnel (${filteredPersonnel.length})`} styles={{ body: { paddingTop: 8 } }}>
        <Flex gap={12} wrap="wrap" style={{ marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Search ID, name, rank, department…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ flex: "1 1 240px", maxWidth: 420 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: "all", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
          />
        </Flex>

        <Table<Personnel>
          loading={loading}
          rowKey="id"
          size="middle"
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} personnel`,
          }}
          dataSource={filteredPersonnel}
          columns={columns}
          onRow={(record) => ({
            onClick: () => router.push(`/personnel/profile?id=${record.id}`),
            style: { cursor: "pointer" },
          })}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  search || statusFilter !== "all"
                    ? "No personnel match your filters"
                    : "No personnel records yet"
                }
              >
                {!search && statusFilter === "all" ? (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Add first personnel
                  </Button>
                ) : null}
              </Empty>
            ),
          }}
        />
      </Card>

      <AddPersonnelModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSaved={async () => {
          await refetch();
        }}
      />
    </Space>
  );
}
