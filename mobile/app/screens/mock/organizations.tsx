export interface Branch {
  id: string;
  name: string;
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
  branches?: Branch[];
}

export const organizations: Organization[] = [
  {
    id: "org1",
    name: "City Bank",
    logo: "account-balance",
    type: "bank",
    branches: [
      { id: "b1", name: "Downtown Branch" },
      { id: "b2", name: "Airport Branch" },
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
      { id: "b1", name: "Main Campus" },
      { id: "b2", name: "Annex Clinic" },
    ],
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
