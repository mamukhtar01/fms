export type UserRole = "ADMIN" | "OFFICER";

export type FirearmStatus =
  | "Available"
  | "Assigned"
  | "Under Maintenance"
  | "Lost"
  | "Retired";

export type FirearmCondition = "Excellent" | "Good" | "Fair" | "Damaged";

export interface Firearm {
  id: string;
  firearmId: string;
  weaponType: string;
  weaponName: string;
  model: string;
  serialNumber: string;
  ownershipType: "Company-Owned" | "Personally-Owned";
  ownerName: string;
  condition: FirearmCondition;
  status: FirearmStatus;
  currentLocation: string;
  currentHolder: string;
  createdBy: string;
}

export interface Personnel {
  id: string;
  personnelId: string;
  fullName: string;
  rank: string;
  position: string;
  department: string;
  phone: string;
  status: "Active" | "Inactive";
}

export interface Assignment {
  id: string;
  assignmentNumber: string;
  firearmId: string;
  officerName: string;
  assignedBy: string;
  assignmentDateTime: string;
  expectedReturnDate: string;
  status: "Active" | "Returned" | "Overdue";
  issueCondition: FirearmCondition;
  returnCondition?: FirearmCondition;
}

export interface Movement {
  id: string;
  firearmId: string;
  movementType:
    | "Registered"
    | "Assigned"
    | "Returned"
    | "Ownership Transfer"
    | "Location Change"
    | "Maintenance Start"
    | "Maintenance Complete"
    | "Status Change"
    | "Lost"
    | "Found"
    | "Retired";
  movementDateTime: string;
  performedBy: string;
  remarks: string;
}

export interface DashboardKpi {
  key: string;
  title: string;
  value: number;
  color: string;
}

export interface AuthSession {
  userId: string;
  name: string;
  role: UserRole;
}
