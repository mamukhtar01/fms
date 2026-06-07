"use client";

import { getAssignments } from "@/lib/services/assignments";
import { getFirearms } from "@/lib/services/firearms";
import { getPersonnelList } from "@/lib/services/personnel";
import type { Firearm, FirearmAssignment } from "@/types/domain";
import {
  CheckCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

const FIREARM_STATUS_COLOR = {
  Available: "success",
  Assigned: "warning",
  "Under Maintenance": "processing",
  Retired: "default",
} as const;

const ASSIGNMENT_STATUS_COLOR = {
  Active: "blue",
  Returned: "green",
  Overdue: "red",
} as const;

export default function DashboardPage() {
  const [ownershipFilter, setOwnershipFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: firearms = [],
    isFetching: loadingFirearms,
    isError: firearmsError,
    refetch: refetchFirearms,
  } = useQuery<Firearm[]>({
    queryKey: ["firearms"],
    queryFn: getFirearms,
  });

  const { data: personnel = [], isFetching: loadingPersonnel } = useQuery({
    queryKey: ["personnel"],
    queryFn: getPersonnelList,
  });

  const {
    data: assignments = [],
    isFetching: loadingAssignments,
    isError: assignmentsError,
    refetch: refetchAssignments,
  } = useQuery<FirearmAssignment[]>({
    queryKey: ["assignments"],
    queryFn: getAssignments,
  });

  const kpis = useMemo(
    () => ({
      total: firearms.length,
      available: firearms.filter((f) => f.status === "Available").length,
      assigned: firearms.filter((f) => f.status === "Assigned").length,
      maintenance: firearms.filter((f) => f.status === "Under Maintenance").length,
      retired: firearms.filter((f) => f.status === "Retired").length,
      sibc: firearms.filter((f) => f.ownershipType === "sibc").length,
      personal: firearms.filter((f) => f.ownershipType === "person").length,
      totalPersonnel: personnel.length,
      totalAssignments: assignments.length,
      activeAssignments: assignments.filter((a) => a.status === "Active").length,
      overdueReturns: assignments.filter((a) => a.status === "Overdue").length,
    }),
    [firearms, personnel, assignments],
  );

  const filteredFirearms = useMemo(
    () =>
      firearms.filter((f) => {
        const ownershipMatch =
          ownershipFilter === "all" || f.ownershipType === ownershipFilter;
        const statusMatch =
          statusFilter === "all" ||
          (statusFilter === "in" && f.status === "Available") ||
          (statusFilter === "out" && f.status === "Assigned") ||
          f.status === statusFilter;
        return ownershipMatch && statusMatch;
      }),
    [firearms, ownershipFilter, statusFilter],
  );

  const recentAssignments = useMemo(() => assignments.slice(0, 10), [assignments]);

  async function exportToExcel() {
    const { utils, writeFile } = await import("xlsx");
    const rows = filteredFirearms.map((f) => ({
      "Firearm ID": f.firearmId,
      "Weapon Type": f.weaponType,
      Model: f.model,
      "Serial Number": f.serialNumber,
      Manufacturer: f.manufacturer,
      Caliber: f.caliber,
      Ownership: f.ownershipType === "sibc" ? "SIBC" : "Personal",
      Owner: f.ownerName,
      Status: f.status,
      Condition: f.condition,
      "Current Holder": f.currentHolderName || "",
      "Date Acquired": f.dateAcquired,
    }));
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Firearms");
    writeFile(wb, `firearms-${dayjs().format("YYYY-MM-DD")}.xlsx`);
  }

  const firearmsColumns: TableColumnsType<Firearm> = [
    {
      title: "Firearm ID",
      dataIndex: "firearmId",
      width: 120,
      render: (v: string) => <Typography.Text strong>{v}</Typography.Text>,
    },
    {
      title: "Type / Model",
      key: "typeModel",
      width: 160,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{row.weaponType}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.model}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Ownership",
      dataIndex: "ownershipType",
      width: 100,
      render: (v: string) =>
        v === "sibc" ? (
          <Tag color="processing">SIBC</Tag>
        ) : (
          <Tag color="purple">Personal</Tag>
        ),
    },
    {
      title: "Owner",
      dataIndex: "ownerName",
      width: 150,
      ellipsis: true,
      render: (v: string) => v || <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (status: keyof typeof FIREARM_STATUS_COLOR) => (
        <Tag color={FIREARM_STATUS_COLOR[status]}>{status}</Tag>
      ),
    },
    {
      title: "Current Holder",
      dataIndex: "currentHolderName",
      ellipsis: true,
      render: (v: string) => v || <Typography.Text type="secondary">—</Typography.Text>,
    },
  ];

  const assignmentColumns: TableColumnsType<FirearmAssignment> = [
    {
      title: "Firearm",
      key: "firearm",
      width: 120,
      render: (_, row) => (
        <Typography.Text strong>{row.firearmCode || row.firearmId}</Typography.Text>
      ),
    },
    {
      title: "Officer",
      dataIndex: "officerName",
      width: 160,
      ellipsis: true,
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      ellipsis: true,
    },
    {
      title: "Expected Return",
      dataIndex: "expectedReturnDate",
      width: 130,
      render: (v: string) =>
        v ? (
          <Typography.Text
            type={
              dayjs(v).isBefore(dayjs(), "day") ? "danger" : undefined
            }
          >
            {dayjs(v).format("DD-MMM-YYYY")}
          </Typography.Text>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      render: (status: keyof typeof ASSIGNMENT_STATUS_COLOR) => (
        <Tag color={ASSIGNMENT_STATUS_COLOR[status]}>{status}</Tag>
      ),
    },
  ];

  const isRefreshing = loadingFirearms || loadingPersonnel || loadingAssignments;

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Card variant="borderless" styles={{ body: { padding: "24px 28px" } }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Dashboard
            </Typography.Title>
            <Typography.Text type="secondary">
              Live overview of firearms inventory and assignments.
            </Typography.Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            loading={isRefreshing}
            onClick={() => {
              void refetchFirearms();
              void refetchAssignments();
            }}
          >
            Refresh
          </Button>
        </Flex>
      </Card>

      {/* KPI row */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Firearms"
              value={kpis.total}
              prefix={<SafetyCertificateOutlined style={{ color: "#1677ff" }} />}
              loading={loadingFirearms}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Available (In)"
              value={kpis.available}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              styles={{ content: { color: "#389e0d" } }}
              loading={loadingFirearms}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Assigned (Out)"
              value={kpis.assigned}
              prefix={<UserOutlined style={{ color: "#faad14" }} />}
              styles={{ content: { color: "#d48806" } }}
              loading={loadingFirearms}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Under Maintenance"
              value={kpis.maintenance}
              prefix={<ToolOutlined style={{ color: "#722ed1" }} />}
              loading={loadingFirearms}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="SIBC Owned"
              value={kpis.sibc}
              prefix={<SafetyCertificateOutlined style={{ color: "#13c2c2" }} />}
              loading={loadingFirearms}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Personally Owned"
              value={kpis.personal}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
              loading={loadingFirearms}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Personnel"
              value={kpis.totalPersonnel}
              prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
              loading={loadingPersonnel}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Overdue Returns"
              value={kpis.overdueReturns}
              prefix={<ExclamationCircleOutlined style={{ color: "#f5222d" }} />}
              styles={{
                content: { color: kpis.overdueReturns > 0 ? "#f5222d" : undefined },
              }}
              loading={loadingAssignments}
            />
          </Card>
        </Col>
      </Row>

      {/* Firearms table with filters + export */}
      {firearmsError ? (
        <Alert
          type="error"
          showIcon
          description={
            <>
              <strong>Could not load firearms.</strong> Please try again.
            </>
          }
          action={
            <Button size="small" onClick={() => void refetchFirearms()}>
              Retry
            </Button>
          }
        />
      ) : (
        <Card
          title={`Firearms Inventory — ${filteredFirearms.length} of ${firearms.length}`}
          extra={
            <Button
              icon={<DownloadOutlined />}
              onClick={() => void exportToExcel()}
              disabled={filteredFirearms.length === 0}
            >
              Export to Excel
            </Button>
          }
          styles={{ body: { paddingTop: 8 } }}
        >
          <Flex gap={12} wrap="wrap" style={{ marginBottom: 16 }}>
            <Select
              value={ownershipFilter}
              onChange={setOwnershipFilter}
              style={{ width: 180 }}
              options={[
                { value: "all", label: "All Ownership" },
                { value: "sibc", label: "SIBC Owned" },
                { value: "person", label: "Personally Owned" },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 190 }}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "in", label: "In — Available" },
                { value: "out", label: "Out — Assigned" },
                { value: "Under Maintenance", label: "Under Maintenance" },
                { value: "Retired", label: "Retired" },
              ]}
            />
          </Flex>
          <Table<Firearm>
            loading={loadingFirearms}
            rowKey="id"
            size="small"
            scroll={{ x: 860 }}
            pagination={{ pageSize: 8, showSizeChanger: false, hideOnSinglePage: true }}
            dataSource={filteredFirearms}
            columns={firearmsColumns}
          />
        </Card>
      )}

      {/* Recent assignments */}
      {assignmentsError ? (
        <Alert
          type="error"
          showIcon
          description={
            <>
              <strong>Could not load assignments.</strong> Please try again.
            </>
          }
          action={
            <Button size="small" onClick={() => void refetchAssignments()}>
              Retry
            </Button>
          }
        />
      ) : (
        <Card title={`Recent Assignments (last ${recentAssignments.length})`}>
          <Table<FirearmAssignment>
            loading={loadingAssignments}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 660 }}
            dataSource={recentAssignments}
            columns={assignmentColumns}
          />
        </Card>
      )}
    </Space>
  );
}
