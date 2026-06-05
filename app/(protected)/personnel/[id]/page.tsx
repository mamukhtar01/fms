"use client";

import type { Personnel } from "@/types/domain";
import { AddPersonnelModal } from "@/components/personnel/add-personnel-modal";
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  CrownOutlined,
  EditOutlined,
  IdcardOutlined,
  PhoneOutlined,
  SafetyOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Card, Col, Empty, Row, Skeleton, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

interface DetailItemProps {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}

function DetailItem({ label, value, icon }: DetailItemProps) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0" }}>
      {icon ? <div style={{ fontSize: 16, color: "#8c8c8c", marginTop: 2, display: "flex" }}>{icon}</div> : null}
      <div>
        <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 14, color: "#262626", marginTop: 2 }}>{value || "—"}</div>
      </div>
    </div>
  );
}

function getInitials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PersonnelDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const personnelId = params.id;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: person, isLoading, isError, error, refetch } = useQuery<Personnel>({
    queryKey: ["personnel", personnelId],
    queryFn: async () => {
      const response = await fetch(`/api/personnel/${personnelId}`, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await response.json()) as { item?: Personnel; message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to load personnel");
      }
      if (!payload.item) {
        throw new Error("Personnel record not found");
      }
      return payload.item;
    },
    enabled: Boolean(personnelId),
    retry: false,
  });

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Breadcrumb
        items={[
          { title: <Link href="/personnel">Personnel</Link> },
          { title: person?.fullName ?? "Details" },
        ]}
      />

      {isLoading ? (
        <Card style={{ borderRadius: 8 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : isError ? (
        <Card style={{ borderRadius: 8 }}>
          <Empty
            description={error instanceof Error ? error.message : "Unable to load personnel"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => router.push("/personnel")}>
              Return to personnel list
            </Button>
          </Empty>
        </Card>
      ) : person ? (
        <Row gutter={[24, 24]} align="stretch">
          <Col xs={24} lg={8}>
            <Card
              style={{
                height: "100%",
                borderRadius: 8,
                border: "1px solid #f0f0f0",
              }}
            >
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    backgroundColor: "#f5f5f5",
                    color: "#595959",
                    fontSize: 24,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    border: "1px solid #d9d9d9",
                  }}
                >
                  {getInitials(person.fullName)}
                </div>
                <Typography.Title level={4} style={{ margin: "0 0 4px", fontWeight: 500 }}>
                  {person.fullName}
                </Typography.Title>
                <Typography.Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 12, fontSize: 14 }}
                >
                  {person.rank} • {person.position}
                </Typography.Text>
                <Tag
                  color={person.status === "Active" ? "success" : "default"}
                  style={{
                    borderRadius: 4,
                    fontWeight: 500,
                  }}
                >
                  {person.status}
                </Tag>

                <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ width: "100%", borderRadius: 6 }}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push("/personnel")}
                    style={{ width: "100%", borderRadius: 6 }}
                  >
                    Back to Directory
                  </Button>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              <Card
                title={<span style={{ fontWeight: 500, fontSize: 15 }}>Employment Details</span>}
                style={{ borderRadius: 8 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <DetailItem
                      label="Personnel ID"
                      value={person.personnelId}
                      icon={<IdcardOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailItem label="Rank" value={person.rank} icon={<CrownOutlined />} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailItem
                      label="Position"
                      value={person.position}
                      icon={<SolutionOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailItem
                      label="Department"
                      value={person.department}
                      icon={<ApartmentOutlined />}
                    />
                  </Col>
                </Row>
              </Card>

              <Card
                title={<span style={{ fontWeight: 500, fontSize: 15 }}>Contact & Security</span>}
                style={{ borderRadius: 8 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <DetailItem label="Phone Number" value={person.phone} icon={<PhoneOutlined />} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailItem label="National ID" value={person.nationalId} icon={<SafetyOutlined />} />
                  </Col>
                </Row>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  padding: "4px 4px",
                  fontSize: 12,
                  color: "#8c8c8c",
                }}
              >
                {person.created ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <CalendarOutlined style={{ fontSize: 13 }} /> Record Created:{" "}
                    {dayjs(person.created).format("DD MMM YYYY, HH:mm")}
                  </span>
                ) : null}
                {person.updated ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <CalendarOutlined style={{ fontSize: 13 }} /> Last Updated:{" "}
                    {dayjs(person.updated).format("DD MMM YYYY, HH:mm")}
                  </span>
                ) : null}
              </div>
            </Space>
          </Col>
        </Row>
      ) : null}

      {person ? (
        <AddPersonnelModal
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          personnel={person}
          onSaved={async () => {
            await refetch();
          }}
        />
      ) : null}
    </Space>
  );
}
