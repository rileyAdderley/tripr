export type Destination = {
  id: string;
  name: string;
  country: string;
};

export type Trip = {
  id: string;
  name: string;
  destinations: Destination[];
  startDate: string;
  endDate?: string;
  summary?: string;
  createdAt: string;
};
