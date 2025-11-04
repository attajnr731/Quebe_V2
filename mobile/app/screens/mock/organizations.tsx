// mock/organizations.ts
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
}

export const organizations: Organization[] = [
  {
    id: "org1",
    name: "City Bank",
    logo: "account-balance",
    type: "bank",
    services: [
      { id: "s1", name: "Account Opening", queueSize: 12, avgWaitMin: 8 },
      { id: "s2", name: "Loan Inquiry", queueSize: 5, avgWaitMin: 15 },
      { id: "s3", name: "Cash Deposit", queueSize: 8, avgWaitMin: 5 },
    ],
  },
  {
    id: "org2",
    name: "MediCare Hospital",
    logo: "local-hospital",
    type: "hospital",
    queueSize: 42,
    avgWaitMin: 25,
  },
  {
    id: "org3",
    name: "DMV Office",
    logo: "directions-car",
    type: "gov",
    queueSize: 18,
    avgWaitMin: 30,
  },
  {
    id: "org4",
    name: "QuickMart",
    logo: "local-grocery-store",
    type: "other",
    queueSize: 6,
    avgWaitMin: 3,
  },
];
