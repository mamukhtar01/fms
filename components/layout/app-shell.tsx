"use client";

import {
  AppstoreOutlined,
  AuditOutlined,
  HistoryOutlined,
  LockOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const menuItems: MenuItem[] = [
  { key: "/dashboard", icon: <AppstoreOutlined />, label: "Dashboard" },
  { key: "/firearms", icon: <LockOutlined />, label: "Firearms" },
  { key: "/personnel", icon: <TeamOutlined />, label: "Personnel" },
  { key: "/assignments", icon: <AuditOutlined />, label: "Assignments" },
  { key: "/ammunition", icon: <AuditOutlined />, label: "Ammunition" },
  { key: "/accessories", icon: <AuditOutlined />, label: "Accessories" },
  { key: "/ownership", icon: <AuditOutlined />, label: "Ownership" },
  { key: "/history", icon: <HistoryOutlined />, label: "History" },
  { key: "/reports", icon: <AuditOutlined />, label: "Reports" },
  { key: "/users", icon: <TeamOutlined />, label: "Users" },
  { key: "/settings", icon: <SettingOutlined />, label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const selectedKey = useMemo(() => {
    const matched = menuItems.find((item) => pathname.startsWith(String(item?.key)));
    return matched ? [String(matched.key)] : ["/dashboard"];
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: "white", padding: 16, fontWeight: 700 }}>SIBC AFMS</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey}
          items={menuItems}
          onClick={({ key }) => router.push(String(key))}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "white",
            paddingInline: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Space direction="vertical" size={0}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              SIBC Armoury & Firearms Management System
            </Typography.Title>
            <Typography.Text type="secondary">Secure Accountability & Chain of Custody</Typography.Text>
          </Space>
          <Button icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        </Header>
        <Content style={{ margin: 16 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
