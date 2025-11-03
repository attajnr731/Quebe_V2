export const waitingQueue = [
  {
    id: 1,
    code: 'Q-101',
    specialist: 'Dr. Smith',
    waitingTime: '23',
    servingTime: '5',
    point: 'OPD',
    status: 'serving'
  },
  {
    id: 2,
    code: 'Q-102',
    specialist: 'Dr. Jones',
    waitingTime: '5',
    point: "Doctor's Room",
    status: 'waiting'
  },
  {
    id: 3,
    code: 'Q-103',
    specialist: 'Dr. Brown',
    waitingTime: '12',
    point: 'Lab',
    status: 'waiting'
  }
]

export const servedQueue = [
  {
    id: 1,
    code: 'S-201',
    specialist: 'Dr. Taylor',
    waitingTime: '2',
    servingTime: '8',
    point: 'Pharmacy',
    status: 'serving'
  },
  {
    id: 2,
    code: 'S-202',
    specialist: 'Dr. Wilson',
    waitingTime: '7',
    servingTime: '10',
    point: 'OPD',
    status: 'serving'
  },
  {
    id: 3,
    code: 'S-203',
    specialist: 'Dr. Davis',
    waitingTime: '4',
    servingTime: '6',
    point: "Doctor's Room",
    status: 'serving'
  }
]

export const pendingQueue = [
  {
    id: 1,
    code: 'P-301',
    specialist: 'Dr. Lee',
    waitingTime: '3',
    point: 'Lab',
    status: 'pending'
  },
  {
    id: 2,
    code: 'P-302',
    specialist: 'Dr. Clark',
    waitingTime: '8',
    point: 'Pharmacy',
    status: 'pending'
  },
  {
    id: 3,
    code: 'P-303',
    specialist: 'Dr. Harris',
    waitingTime: '15',
    point: 'OPD',
    status: 'pending'
  }
]
