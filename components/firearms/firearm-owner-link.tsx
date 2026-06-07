"use client";

import type { Firearm } from "@/types/domain";
import { TeamOutlined } from "@ant-design/icons";
import { Tag, Typography } from "antd";
import Link from "next/link";

interface FirearmOwnerLinkProps {
  firearm: Firearm;
}

export function FirearmOwnerLink({ firearm }: FirearmOwnerLinkProps) {
  if (firearm.ownershipType === "sibc") {
    return <Tag color="processing">SIBC</Tag>;
  }

  if (!firearm.ownerId) {
    return <Typography.Text type="secondary">Not assigned</Typography.Text>;
  }

  const label = firearm.ownerName || "View owner";

  return (
    <Link
      href={`/personnel/profile?id=${firearm.ownerId}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#1677ff" }}
    >
      <TeamOutlined />
      <span>{label}</span>
    </Link>
  );
}
