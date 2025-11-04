// mock/queues.ts
export interface QueueItem {
  id: string;
  orgName: string;
  logo: string; // placeholder – you can use any icon name
  position: number; // 1-based
  totalAhead: number;
  avgServiceTimeMin: number; // minutes per person
  peopleAhead: number;
  estimatedWaitMin: number; // calculated
}

export const mockQueues: QueueItem[] = [
  {
    id: "q1",
    orgName: "City Bank",
    logo: "account-balance",
    position: 2,
    totalAhead: 1,
    avgServiceTimeMin: 5,
    peopleAhead: 1,
    estimatedWaitMin: 5,
  },
  {
    id: "q2",
    orgName: "MediCare Clinic",
    logo: "local-hospital",
    position: 12,
    totalAhead: 11,
    avgServiceTimeMin: 8,
    peopleAhead: 11,
    estimatedWaitMin: 88,
  },
];
