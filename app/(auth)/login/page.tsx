"use client";

import { Button, Card, Form, Input, Select, Space, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginValues {
  email: string;
  password: string;
  role: "ADMIN" | "OFFICER";
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onFinish(values: LoginValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        throw new Error(body.message ?? "Login failed");
      }

      message.success("Login successful");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Unable to authenticate");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <Card style={{ width: "100%", maxWidth: 460 }}>
        <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            SIBC AFMS Login
          </Typography.Title>
          <Typography.Text type="secondary">
            Secure access for armoury administrators and officers.
          </Typography.Text>
        </Space>

        <Form<LoginValues> layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="user@sibc.local" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item name="role" label="Role" initialValue="OFFICER" rules={[{ required: true }]}>
            <Select options={[{ label: "Admin", value: "ADMIN" }, { label: "Officer", value: "OFFICER" }]} />
          </Form.Item>
          <Button block type="primary" htmlType="submit" loading={isLoading}>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
