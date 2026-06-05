"use client";

import { IssueAssignmentModal } from "@/components/assignments/issue-assignment-modal";
import { ReturnAssignmentModal } from "@/components/assignments/return-assignment-modal";
import type { FirearmAssignment, AssignmentStatus } from "@/types/domain";
import {
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  RollbackOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
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
  Tooltip,
} from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

const STATUS_COLORS: Record<AssignmentStatus, string> = {
  Active: "processing",
  Returned: "success",
  Overdue: "error",
};

export default function AssignmentsPage() {
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<FirearmAssignment | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: assignments = [],
    isFetching: loading,
    refetch,
    isError,
    error,
  } = useQuery<FirearmAssignment[]>({
    queryKey: ["assignments"],
    queryFn: async () => {
      const response = await fetch("/api/assignments", { cache: "no-store", credentials: "include" });
      const payload = (await response.json()) as { items?: FirearmAssignment[]; message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to load assignments");
      }

      return payload.items ?? [];
    },
    retry: false,
  });

  // Dynamically calculate and check if an Active assignment is actually Overdue
  const processedAssignments = useMemo(() => {
    return assignments.map((item) => {
      if (item.status === "Active" && dayjs(item.expectedReturnDate).isBefore(dayjs(), "day")) {
        return { ...item, status: "Overdue" as AssignmentStatus };
      }
      return item;
    });
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return processedAssignments.filter((item) => {
      const statusMatch = statusFilter === "all" || item.status === statusFilter;
      const searchMatch =
        !term ||
        (item.assignmentNumber || "").toLowerCase().includes(term) ||
        (item.firearmCode || "").toLowerCase().includes(term) ||
        (item.firearmModel || "").toLowerCase().includes(term) ||
        (item.officerName || "").toLowerCase().includes(term) ||
        (item.officerCode || "").toLowerCase().includes(term) ||
        (item.assignedByName || "").toLowerCase().includes(term) ||
        (item.purpose || "").toLowerCase().includes(term);

      return statusMatch && searchMatch;
    });
  }, [processedAssignments, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: processedAssignments.length,
      active: processedAssignments.filter((item) => item.status === "Active").length,
      overdue: processedAssignments.filter((item) => item.status === "Overdue").length,
      returned: processedAssignments.filter((item) => item.status === "Returned").length,
    };
  }, [processedAssignments]);

  const columns: TableColumnsType<FirearmAssignment> = [
    {
      title: "Assignment No.",
      dataIndex: "assignmentNumber",
      width: 140,
      fixed: "left",
      render: (value: string, record) => (
        <Typography.Text strong>{value || record.id.slice(-6).toUpperCase()}</Typography.Text>
      ),
    },
    {
      title: "Firearm",
      key: "firearm",
      width: 180,
      render: (_, row) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{row.firearmCode || row.firearmId}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.firearmModel} {row.firearmSerial ? `(${row.firearmSerial})` : ""}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Officer",
      key: "officer",
      width: 180,
      render: (_, row) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text>{row.officerName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.officerCode || row.officerId}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Dates",
      key: "dates",
      width: 200,
      render: (_, row) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text style={{ fontSize: 13 }}>
            Assigned: {dayjs(row.assignmentDatetime).format("YYYY-MM-DD HH:mm")}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Expected Return: {dayjs(row.expectedReturnDate).format("YYYY-MM-DD")}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Ammunition",
      key: "ammunition",
      width: 150,
      render: (_, row) =>
        row.quantityIssued && row.quantityIssued > 0 ? (
          <Space orientation="vertical" size={0}>
            <Typography.Text style={{ fontSize: 13 }}>
              Issued: {row.quantityIssued} rds
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Type: {row.ammunitionType}
            </Typography.Text>
            {row.status === "Returned" && (
              <Typography.Text type="secondary" style={{ fontSize: 11, color: row.quantityMissing ? "#ff4d4f" : "#52c41a" }}>
                Ret: {row.quantityReturned} | Exp: {row.quantityExpended} | Mis: {row.quantityMissing}
              </Typography.Text>
            )}
          </Space>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (status: AssignmentStatus) => (
        <Tag color={STATUS_COLORS[status]}>{status}</Tag>
      ),
    },
    {
      title: "Action / Returns",
      key: "action",
      width: 160,
      fixed: "right",
      render: (_, row) => {
        if (row.status === "Active" || row.status === "Overdue") {
          return (
            <Button
              type="link"
              icon={<RollbackOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAssignment(row);
                setIsReturnOpen(true);
              }}
            >
              Return Weapon
            </Button>
          );
        }

        return (
          <Tooltip title={`Condition on return: ${row.returnCondition || "Good"}`}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Returned {dayjs(row.actualReturnDatetime).format("YYYY-MM-DD")}
            </Typography.Text>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      {/* Header card */}
      <Card bordered={false} styles={{ body: { padding: "24px 28px" } }}>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Firearm Assignments
            </Typography.Title>
            <Typography.Text type="secondary">
              Manage operational firearm checkouts, ammunition distribution, and return logs.
            </Typography.Text>
          </div>
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={() => void refetch()} loading={loading}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsIssueOpen(true)}>
              Issue Firearm
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* Stats row */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Assignments"
              value={stats.total}
              prefix={<AuditOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Active Issues"
              value={stats.active}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              styles={{ content: { color: "#d48806" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Overdue Returns"
              value={stats.overdue}
              prefix={<ClockCircleOutlined style={{ color: "#ff4d4f" }} />}
              styles={{ content: { color: "#cf1322" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Completed Returns"
              value={stats.returned}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              styles={{ content: { color: "#389e0d" } }}
            />
          </Card>
        </Col>
      </Row>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load firearm assignments"
          description={error instanceof Error ? error.message : "Please try again."}
          action={
            <Button size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      {/* List card */}
      <Card title={`Assignments List (${filteredAssignments.length})`} styles={{ body: { paddingTop: 8 } }}>
        <Flex gap={12} wrap="wrap" style={{ marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Search ASN, firearm code, officer, purpose..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ flex: "1 1 240px", maxWidth: 420 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "Active", label: "Active" },
              { value: "Overdue", label: "Overdue" },
              { value: "Returned", label: "Returned" },
            ]}
          />
        </Flex>

        <Table<FirearmAssignment>
          loading={loading}
          rowKey="id"
          size="middle"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} assignments`,
          }}
          dataSource={filteredAssignments}
          columns={columns}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  search || statusFilter !== "all"
                    ? "No assignments match your filters"
                    : "No assignments recorded yet"
                }
              >
                {!search && statusFilter === "all" ? (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsIssueOpen(true)}>
                    Issue First Firearm
                  </Button>
                ) : null}
              </Empty>
            ),
          }}
        />
      </Card>

      {/* Issue Modal */}
      <IssueAssignmentModal
        open={isIssueOpen}
        onCancel={() => setIsIssueOpen(false)}
        onSaved={async () => {
          await refetch();
        }}
      />

      {/* Return Modal */}
      <ReturnAssignmentModal
        assignment={selectedAssignment}
        open={isReturnOpen}
        onCancel={() => {
          setIsReturnOpen(false);
          setSelectedAssignment(null);
        }}
        onSaved={async () => {
          await refetch();
        }}
      />
    </Space>
  );
}
