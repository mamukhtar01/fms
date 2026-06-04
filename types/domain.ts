/** PocketBase collection names */
export const COLLECTIONS = {
  users: "users",
  firearms: "firearms",
  personnel: "personnel",
  firearmAssignments: "firearm_assignments",
  firearmMovements: "firearm_movements",
  firearmAccessories: "firearm_accessories",
  accessoryAssignments: "accessory_assignments",
  ammunitionBatches: "ammunition_batches",
  ammunitionIssues: "ammunition_issues",
  firearmInspections: "firearm_inspections",
  locations: "locations",
} as const;

export type UserRole = "ADMIN" | "OFFICER";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  verified?: boolean;
  avatar?: string;
}

export type FirearmOwnershipType = "sibc" | "person";
export type FirearmStatus = "Available" | "Assigned" | "Under Maintenance" | "Retired";
export type FirearmCondition = "Good" | "New" | "Damaged";

export interface Firearm {
  id: string;
  firearmId: string;
  weaponType: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  caliber: string;
  registrationNumber: string;
  assetTag: string;
  ownershipType: FirearmOwnershipType;
  ownerId: string;
  ownerName: string;
  status: FirearmStatus;
  condition: FirearmCondition;
  currentHolderId: string;
  currentHolderName: string;
  dateAcquired: string;
  image?: string;
  createdById: string;
  createdByName: string;
  notes: string;
  remarks: string;
  created?: string;
  updated?: string;
}

export type PersonnelStatus = "Active" | "Inactive";

export interface Personnel {
  id: string;
  personnelId: string;
  fullName: string;
  rank: string;
  position: string;
  department: string;
  phone: string;
  nationalId: string;
  status: PersonnelStatus;
  created?: string;
  updated?: string;
}

export type AssignmentCondition = "Excellent" | "Good" | "Damaged";
export type AssignmentStatus = "Active" | "Returned" | "Overdue";

export interface FirearmAssignment {
  id: string;
  firearmId: string;
  officerId: string;
  officerName: string;
  assignedById: string;
  assignedByName: string;
  assignmentDatetime: string;
  expectedReturnDate: string;
  actualReturnDatetime?: string;
  issueCondition: AssignmentCondition;
  returnCondition?: AssignmentCondition;
  remarks: string;
  status: AssignmentStatus;
  notes: string;
}

export type MovementType = "IN" | "OUT";

export interface FirearmMovement {
  id: string;
  firearmId: string;
  movementType: MovementType;
  newHolderId: string;
  newHolderName: string;
  previousHolderId: string;
  previousHolderName: string;
  performedById: string;
  performedByName: string;
  movementDatetime: string;
  remarks: string;
  notes: string;
}

export interface FirearmAccessory {
  id: string;
  firearmId: string;
}

export interface AccessoryAssignment {
  id: string;
  notes: string;
}

export interface AmmunitionBatch {
  id: string;
  notes: string;
}

export interface AmmunitionIssue {
  id: string;
  returnedQuantity?: number;
}

export interface FirearmInspection {
  id: string;
  nextCheckDate: string;
}

export interface Location {
  id: string;
  contactPerson: string;
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

/** @deprecated Use FirearmAssignment */
export type Assignment = FirearmAssignment;

/** @deprecated Use FirearmMovement */
export type Movement = FirearmMovement;
