"use client";

import type { Personnel } from "@/types/domain";
import { AddPersonnelModal } from "@/components/personnel/add-personnel-modal";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Card, Descriptions, Empty, Skeleton, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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

      <Card styles={{ body: { padding: "20px 24px" } }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Personnel profile
            </Typography.Title>
            <Typography.Text type="secondary">
              Owner and assignment details for armoury personnel.
            </Typography.Text>
          </div>
          <Space wrap>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditModalOpen(true)}
              disabled={isLoading || isError || !person}
            >
              Edit
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/personnel")}>
              Back to directory
            </Button>
          </Space>
        </Space>
      </Card>

      <Card>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : isError ? (
          <Empty
            description={error instanceof Error ? error.message : "Unable to load personnel"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => router.push("/personnel")}>
              Return to personnel list
            </Button>
          </Empty>
        ) : person ? (
          <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="middle">
            <Descriptions.Item label="Full name">{person.fullName || "—"}</Descriptions.Item>
            <Descriptions.Item label="Personnel ID">{person.personnelId || "—"}</Descriptions.Item>
            <Descriptions.Item label="Rank">{person.rank || "—"}</Descriptions.Item>
            <Descriptions.Item label="Position">{person.position || "—"}</Descriptions.Item>
            <Descriptions.Item label="Department">{person.department || "—"}</Descriptions.Item>
            <Descriptions.Item label="Phone">{person.phone || "—"}</Descriptions.Item>
            <Descriptions.Item label="National ID">{person.nationalId || "—"}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={person.status === "Active" ? "success" : "default"}>{person.status}</Tag>
            </Descriptions.Item>
            {person.created ? (
              <Descriptions.Item label="Created">
                {dayjs(person.created).format("DD MMM YYYY, HH:mm")}
              </Descriptions.Item>
            ) : null}
            {person.updated ? (
              <Descriptions.Item label="Updated">
                {dayjs(person.updated).format("DD MMM YYYY, HH:mm")}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
        ) : null}
      </Card>

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
