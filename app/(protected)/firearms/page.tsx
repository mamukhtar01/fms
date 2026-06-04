"use client";

import { RegisterFirearmModal } from "@/components/firearms/register-firearm-modal";
import type { Firearm } from "@/types/domain";
import {
  PlusCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
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
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export default function FirearmsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: firearms = [], isFetching: loading, refetch } = useQuery<Firearm[]>({
    queryKey: ["firearms"],
    queryFn: async () => {
      const response = await fetch("/api/firearms", { cache: "no-store", credentials: "include" });
      const payload = (await response.json()) as { items?: Firearm[]; message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to load firearms");
      }

      return payload.items ?? [];
    },
    retry: false,
  });

  const filteredFirearms = useMemo(() => {
    const term = search.trim().toLowerCase();
    return firearms.filter((firearm) => {
      const statusMatch = statusFilter === "all" || firearm.status === statusFilter;
      const searchMatch =
        !term ||
        firearm.firearmId.toLowerCase().includes(term) ||
        firearm.serialNumber.toLowerCase().includes(term) ||
        firearm.weaponName.toLowerCase().includes(term) ||
        firearm.weaponType.toLowerCase().includes(term) ||
        firearm.currentLocation.toLowerCase().includes(term);

      return statusMatch && searchMatch;
    });
  }, [firearms, search, statusFilter]);

  const availability = useMemo(
    () => ({
      total: firearms.length,
      available: firearms.filter((item) => item.status === "Available").length,
      assigned: firearms.filter((item) => item.status === "Assigned").length,
    }),
    [firearms],
  );

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card
          styles={{ body: { padding: 20 } }}
          style={{
            border: "none",
            background:
              "linear-gradient(120deg, rgba(31,59,138,0.98) 0%, rgba(18,107,132,0.98) 55%, rgba(16,139,97,0.95) 100%)",
          }}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
            <Space orientation="vertical" size={2}>
              <Typography.Title level={3} style={{ margin: 0, color: "#f3fbff" }}>
                Firearm Operations
              </Typography.Title>
              <Typography.Text style={{ color: "#d9edf5" }}>
                Register, track, and monitor all firearm assets from a single operational view.
              </Typography.Text>
            </Space>
            <Button
              type="primary"
              size="large"
              icon={<PlusCircleOutlined />}
              style={{ background: "#f5f8ff", color: "#143472", borderColor: "#f5f8ff", fontWeight: 600 }}
              onClick={() => setIsModalOpen(true)}
            >
              Register Firearm
            </Button>
          </Flex>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card>
          <Statistic title="Total Firearms" value={availability.total} prefix={<SafetyCertificateOutlined />} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title="Available" value={availability.available} valueStyle={{ color: "#1f8f5f" }} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title="Assigned" value={availability.assigned} valueStyle={{ color: "#c28a1c" }} />
        </Card>
      </Col>

      <Col span={24}>
        <Card
          title="Firearm Inventory"
          extra={<Button icon={<ReloadOutlined />} onClick={() => void refetch()}>Refresh</Button>}
        >
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={16}>
              <Input.Search
                allowClear
                placeholder="Search by firearm ID, serial, type, weapon name, or location"
                onSearch={setSearch}
                onChange={(event) => setSearch(event.target.value)}
                value={search}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "Available", label: "Available" },
                  { value: "Assigned", label: "Assigned" },
                  { value: "Under Maintenance", label: "Under Maintenance" },
                  { value: "Lost", label: "Lost" },
                  { value: "Retired", label: "Retired" },
                ]}
              />
            </Col>
          </Row>

          <Table
            loading={loading}
            rowKey="id"
            dataSource={filteredFirearms}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    search || statusFilter !== "all"
                      ? "No firearms matched your filters"
                      : "No firearms found in the collection"
                  }
                />
              ),
            }}
            columns={[
              { title: "Firearm ID", dataIndex: "firearmId" },
              { title: "Serial Number", dataIndex: "serialNumber" },
              { title: "Weapon", dataIndex: "weaponName" },
              { title: "Type", dataIndex: "weaponType" },
              { title: "Ownership", dataIndex: "ownershipType" },
              {
                title: "Status",
                dataIndex: "status",
                render: (status: string) => (
                  <Tag color={status === "Assigned" ? "gold" : status === "Available" ? "green" : "red"}>{status}</Tag>
                ),
              },
              { title: "Location", dataIndex: "currentLocation" },
            ]}
          />
        </Card>
      </Col>

      <RegisterFirearmModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSaved={async () => {
          await refetch();
        }}
      />
    </Row>
  );
}
