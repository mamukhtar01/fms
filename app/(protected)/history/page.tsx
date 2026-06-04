"use client";

import { movements } from "@/data/mock";
import { Card, Timeline, Typography } from "antd";
import dayjs from "dayjs";

export default function HistoryPage() {
  return (
    <Card title="Firearm Timeline & Movement History">
      <Timeline
        items={movements.map((movement) => ({
          color: movement.movementType === "OUT" ? "blue" : "green",
          children: (
            <>
              <Typography.Text strong>
                {dayjs(movement.movementDatetime).format("DD-MMM-YYYY HH:mm")} • {movement.firearmId} • {movement.movementType}
              </Typography.Text>
              <br />
              <Typography.Text type="secondary">
                {movement.remarks} (by {movement.performedByName})
              </Typography.Text>
            </>
          ),
        }))}
      />
    </Card>
  );
}
