// mock/queues.ts
export interface QueueItem {
  id: string;
  orgName: string;
  logo: string;
  position: number;
  totalAhead: number;
  avgServiceTimeMin: number;
  peopleAhead: number;
  estimatedWaitMin: number;
  queueCode: string;
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
    queueCode: "CB01", // added queueCode
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
    queueCode: "MC02", // added queueCode
  },
];
