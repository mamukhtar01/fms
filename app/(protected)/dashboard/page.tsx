"use client";

import { dashboardKpis, assignments, movements } from "@/data/mock";
import { Alert, Card, Col, List, Row, Statistic, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";

export default function DashboardPage() {
  return (
    <Row gutter={[16, 16]}>
      {dashboardKpis.map((kpi) => (
        <Col key={kpi.key} xs={24} sm={12} lg={8} xl={6}>
          <Card>
            <Statistic title={kpi.title} value={kpi.value} valueStyle={{ color: kpi.color }} />
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
                render: (status: string) => <Tag color={status === "Overdue" ? "red" : "blue"}>{status}</Tag>,
              },
            ]}
          />
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Movement Activity">
          <List
            dataSource={movements}
            renderItem={(event) => (
              <List.Item>
                <List.Item.Meta
                  title={`${event.firearmId} • ${event.movementType}`}
                  description={`${dayjs(event.movementDateTime).format("DD-MMM-YYYY HH:mm")} by ${event.performedBy}`}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col span={24}>
        <Alert
          type="info"
          showIcon
          message="Dashboard charts and report widgets are ready for live PocketBase data wiring."
          description={
            <Typography.Text>
              Monthly assignment trends, ammunition usage and accessory discrepancies are structured in the data model and can be populated with collection queries.
            </Typography.Text>
          }
        />
      </Col>
    </Row>
  );
}
