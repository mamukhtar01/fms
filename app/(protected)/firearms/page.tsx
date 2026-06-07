"use client";

import { FirearmOwnerLink } from "@/components/firearms/firearm-owner-link";
import { RegisterFirearmModal } from "@/components/firearms/register-firearm-modal";
import { getFirearms } from "@/lib/services/firearms";
import type { Firearm, FirearmStatus } from "@/types/domain";
import {
  CheckCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

const STATUS_COLORS: Record<FirearmStatus, string> = {
  Available: "success",
  Assigned: "warning",
  "Under Maintenance": "processing",
  Retired: "default",
};

const CONDITION_COLORS: Record<string, string> = {
  Good: "green",
  New: "blue",
  Damaged: "red",
};

export default function FirearmsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<string>("all");

  const {
    data: firearms = [],
    isFetching: loading,
    refetch,
    isError,
    error,
  } = useQuery<Firearm[]>({
    queryKey: ["firearms"],
    queryFn: getFirearms,
    retry: false,
  });

  const filteredFirearms = useMemo(() => {
    const term = search.trim().toLowerCase();
    return firearms.filter((firearm) => {
      const statusMatch = statusFilter === "all" || firearm.status === statusFilter;
      const ownershipMatch = ownershipFilter === "all" || firearm.ownershipType === ownershipFilter;
      const searchMatch =
        !term ||
        firearm.firearmId.toLowerCase().includes(term) ||
        firearm.serialNumber.toLowerCase().includes(term) ||
        firearm.model.toLowerCase().includes(term) ||
        firearm.weaponType.toLowerCase().includes(term) ||
        firearm.manufacturer.toLowerCase().includes(term) ||
        firearm.ownerName.toLowerCase().includes(term) ||
        firearm.currentHolderName.toLowerCase().includes(term);

      return statusMatch && ownershipMatch && searchMatch;
    });
  }, [firearms, search, statusFilter, ownershipFilter]);

  const stats = useMemo(
    () => ({
      total: firearms.length,
      available: firearms.filter((item) => item.status === "Available").length,
      assigned: firearms.filter((item) => item.status === "Assigned").length,
      personal: firearms.filter((item) => item.ownershipType === "person").length,
    }),
    [firearms],
  );

  const columns: TableColumnsType<Firearm> = [
    {
      title: "Firearm ID",
      dataIndex: "firearmId",
      fixed: "left",
      width: 140,
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: "Serial",
      dataIndex: "serialNumber",
      width: 130,
      ellipsis: true,
    },
    {
      title: "Type / Model",
      key: "typeModel",
      width: 160,
      render: (_, row) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text>{row.weaponType}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.model}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Owner",
      key: "owner",
      width: 180,
      render: (_, row) => <FirearmOwnerLink firearm={row} />,
    },
    {
      title: "Ownership",
      dataIndex: "ownershipType",
      width: 110,
      render: (value: string) =>
        value === "sibc" ? <Tag color="processing">SIBC</Tag> : <Tag color="purple">Personal</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 150,
      render: (status: FirearmStatus) => <Tag color={STATUS_COLORS[status]}>{status}</Tag>,
    },
    {
      title: "Condition",
      dataIndex: "condition",
      width: 100,
      render: (condition: string) => (
        <Tag color={CONDITION_COLORS[condition] ?? "default"}>{condition}</Tag>
      ),
    },
    {
      title: "Current holder",
      key: "holder",
      width: 160,
      ellipsis: true,
      render: (_, row) =>
        row.currentHolderId ? (
          <Link
            href={`/personnel/profile?id=${row.currentHolderId}`}
            style={{ color: "#1677ff" }}
          >
            {row.currentHolderName || "View holder"}
          </Link>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
  ];

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Card variant="borderless" styles={{ body: { padding: "24px 28px" } }}>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Firearms inventory
            </Typography.Title>
            <Typography.Text type="secondary">
              Browse registered weapons, filter by status, and open owner profiles from the list.
            </Typography.Text>
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
              Register firearm
            </Button>
          </Space>
        </Flex>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total"
              value={stats.total}
              prefix={<SafetyCertificateOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Available"
              value={stats.available}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              styles={{ content: { color: "#389e0d" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Assigned"
              value={stats.assigned}
              prefix={<UserOutlined style={{ color: "#faad14" }} />}
              styles={{ content: { color: "#d48806" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Personal"
              value={stats.personal}
              prefix={<ToolOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>
      </Row>

      {isError ? (
        <Alert
          type="error"
          showIcon
          description={
            <>
              <strong>Could not load firearms.</strong>{" "}
              {error instanceof Error ? error.message : "Please try again."}
            </>
          }
          action={
            <Button size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      <Card
        title={`Registered firearms (${filteredFirearms.length})`}
        styles={{ body: { paddingTop: 8 } }}
      >
        <Flex gap={12} wrap="wrap" style={{ marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Search ID, serial, model, owner, holder…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ flex: "1 1 240px", maxWidth: 420 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={[
              { value: "all", label: "All statuses" },
              { value: "Available", label: "Available" },
              { value: "Assigned", label: "Assigned" },
              { value: "Under Maintenance", label: "Under Maintenance" },
              { value: "Retired", label: "Retired" },
            ]}
          />
          <Select
            value={ownershipFilter}
            onChange={setOwnershipFilter}
            style={{ width: 160 }}
            options={[
              { value: "all", label: "All ownership" },
              { value: "sibc", label: "SIBC" },
              { value: "person", label: "Personal" },
            ]}
          />
        </Flex>

        <Table<Firearm>
          loading={loading}
          rowKey="id"
          size="middle"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} firearms`,
          }}
          dataSource={filteredFirearms}
          columns={columns}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  search || statusFilter !== "all" || ownershipFilter !== "all"
                    ? "No firearms match your filters"
                    : "No firearms registered yet"
                }
              >
                {!search && statusFilter === "all" && ownershipFilter === "all" ? (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Register first firearm
                  </Button>
                ) : null}
              </Empty>
            ),
          }}
        />
      </Card>

      <RegisterFirearmModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSaved={async () => {
          await refetch();
        }}
      />
    </Space>
  );
}
