"use client";

import { dashboardKpis, assignments, movements } from "@/data/mock";
import {
  Alert,
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";

export default function DashboardPage() {
  return (
    <Row gutter={[16, 16]}>
      {dashboardKpis.map((kpi) => (
        <Col key={kpi.key} xs={24} sm={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title={kpi.title}
              value={kpi.value}
              styles={{ content: { color: kpi.color } }}
            />
          </Card>
        </Col>
      ))}

      <Col xs={24} lg={12}>
        <Card title="Recent Assignments">
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            dataSource={assignments}
            columns={[
              { title: "Assignment", dataIndex: "assignmentNumber" },
              { title: "Firearm", dataIndex: "firearmId" },
              { title: "Officer", dataIndex: "officerName" },
              {
                title: "Status",
                dataIndex: "status",
                render: (status: string) => (
                  <Tag color={status === "Overdue" ? "red" : "blue"}>
                    {status}
                  </Tag>
                ),
              },
            ]}
          />
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Movement Activity">
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            dataSource={movements}
            columns={[
              {
                title: "Movement",
                key: "movement",
                render: (_, event) => `${event.firearmId} • ${event.movementType}`,
              },
              {
                title: "Details",
                key: "details",
                render: (_, event) =>
                  `${dayjs(event.movementDateTime).format("DD-MMM-YYYY HH:mm")} by ${event.performedBy}`,
              },
            ]}
          />
        </Card>
      </Col>

      <Col span={24}>
        <Alert
          type="info"
          showIcon
          title="Refresh to see the latest updates on firearm assignments and movements."
       
        />
      </Col>
    </Row>
  );
}
