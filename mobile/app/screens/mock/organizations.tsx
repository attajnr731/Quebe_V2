// mock/organizations.ts
export interface Branch {
  id: string;
  name: string;
  queueCount?: number; // optional – used for display
  avgWaitTime?: number; // optional – used for display
}

export interface Service {
  id: string;
  name: string;
  queueSize: number;
  avgWaitMin: number;
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  type: "bank" | "hospital" | "gov" | "other";
  services?: Service[];
  queueSize?: number;
  avgWaitMin?: number;
  branches: Branch[]; // <-- now **required**
}

export const organizations: Organization[] = [
  {
    id: "org1",
    name: "City Bank",
    logo: "account-balance",
    type: "bank",
    branches: [
      { id: "b1", name: "Downtown Branch", queueCount: 12, avgWaitTime: 8 },
      { id: "b2", name: "Airport Branch", queueCount: 5, avgWaitTime: 15 },
    ],
    services: [
      { id: "s1", name: "Account Opening", queueSize: 12, avgWaitMin: 8 },
      { id: "s2", name: "Loan Inquiry", queueSize: 5, avgWaitMin: 15 },
    ],
  },
  {
    id: "org2",
    name: "MediCare Hospital",
    logo: "local-hospital",
    type: "hospital",
    branches: [
      { id: "b1", name: "Main Campus", queueCount: 42, avgWaitTime: 25 },
      { id: "b2", name: "Annex Clinic", queueCount: 18, avgWaitTime: 20 },
    ],
    queueSize: 42,
    avgWaitMin: 25,
  },
  {
    id: "org3",
    name: "DMV Office",
    logo: "directions-car",
    type: "gov",
    branches: [
      { id: "b1", name: "Central DMV", queueCount: 18, avgWaitTime: 30 },
    ],
    queueSize: 18,
    avgWaitMin: 30,
  },
  {
    id: "org4",
    name: "QuickMart",
    logo: "local-grocery-store",
    type: "other",
    branches: [{ id: "b1", name: "Main Store", queueCount: 6, avgWaitTime: 3 }],
    queueSize: 6,
    avgWaitMin: 3,
  },
];
