import dayjs from "dayjs";
import type { Assignment, DashboardKpi, Firearm, Movement, Personnel } from "@/types/domain";

export const dashboardKpis: DashboardKpi[] = [
  { key: "total-firearms", title: "Total Firearms", value: 128, color: "#1677ff" },
  { key: "company-owned", title: "Company-Owned", value: 92, color: "#52c41a" },
  { key: "personally-owned", title: "Personally-Owned", value: 36, color: "#13c2c2" },
  { key: "available", title: "Available", value: 64, color: "#2f54eb" },
  { key: "assigned", title: "Assigned", value: 49, color: "#faad14" },
  { key: "maintenance", title: "Under Maintenance", value: 7, color: "#722ed1" },
  { key: "lost", title: "Lost", value: 2, color: "#f5222d" },
  { key: "retired", title: "Retired", value: 6, color: "#8c8c8c" },
  { key: "total-officers", title: "Total Officers", value: 75, color: "#1677ff" },
  { key: "total-assignments", title: "Total Assignments", value: 410, color: "#fa8c16" },
  { key: "active-assignments", title: "Active Assignments", value: 49, color: "#eb2f96" },
  { key: "overdue-returns", title: "Overdue Returns", value: 4, color: "#f5222d" },
];

export const firearms: Firearm[] = [
  {
    id: "f1",
    firearmId: "RF-001",
    weaponType: "Rifle",
    weaponName: "AK Platform",
    model: "AK-103",
    serialNumber: "AK103-778901",
    ownershipType: "Company-Owned",
    ownerName: "SIBC",
    condition: "Excellent",
    status: "Assigned",
    currentLocation: "Airport Security Office",
    currentHolder: "Officer Ahmed",
    createdBy: "admin",
  },
  {
    id: "f2",
    firearmId: "PS-014",
    weaponType: "Pistol",
    weaponName: "Glock",
    model: "G17",
    serialNumber: "G17-660192",
    ownershipType: "Personally-Owned",
    ownerName: "Officer Fatima",
    condition: "Good",
    status: "Available",
    currentLocation: "Main Armoury",
    currentHolder: "Armoury",
    createdBy: "officer01",
  },
];

export const personnel: Personnel[] = [
  {
    id: "p1",
    personnelId: "PER-001",
    fullName: "Ahmed Noor",
    rank: "Inspector",
    position: "Unit Lead",
    department: "Airport Security",
    phone: "+252-61-1234567",
    status: "Active",
  },
  {
    id: "p2",
    personnelId: "PER-002",
    fullName: "Fatima Ali",
    rank: "Officer",
    position: "Storekeeper",
    department: "Main Armoury",
    phone: "+252-61-2345678",
    status: "Active",
  },
];

export const assignments: Assignment[] = [
  {
    id: "a1",
    assignmentNumber: "ASN-2026-0001",
    firearmId: "RF-001",
    officerName: "Ahmed Noor",
    assignedBy: "Fatima Ali",
    assignmentDateTime: dayjs().subtract(4, "day").toISOString(),
    expectedReturnDate: dayjs().add(1, "day").toISOString(),
    status: "Active",
    issueCondition: "Excellent",
  },
  {
    id: "a2",
    assignmentNumber: "ASN-2026-0002",
    firearmId: "PS-014",
    officerName: "Fatima Ali",
    assignedBy: "Admin",
    assignmentDateTime: dayjs().subtract(12, "day").toISOString(),
    expectedReturnDate: dayjs().subtract(2, "day").toISOString(),
    status: "Overdue",
    issueCondition: "Good",
  },
];

export const movements: Movement[] = [
  {
    id: "m1",
    firearmId: "RF-001",
    movementType: "Registered",
    movementDateTime: dayjs().subtract(30, "day").toISOString(),
    performedBy: "Admin",
    remarks: "Initial registration into SIBC inventory",
  },
  {
    id: "m2",
    firearmId: "RF-001",
    movementType: "Assigned",
    movementDateTime: dayjs().subtract(4, "day").toISOString(),
    performedBy: "Fatima Ali",
    remarks: "Issued to Ahmed Noor with 60 rounds and accessory package",
  },
];

export const ammunitionDiscrepancies = [
  {
    key: "1",
    assignmentNumber: "ASN-2026-0002",
    ammunitionType: "9mm",
    quantityIssued: 60,
    quantityReturned: 45,
    quantityExpended: 15,
    quantityMissing: 0,
  },
  {
    key: "2",
    assignmentNumber: "ASN-2026-0010",
    ammunitionType: "7.62mm",
    quantityIssued: 90,
    quantityReturned: 70,
    quantityExpended: 20,
    quantityMissing: 0,
  },
];
