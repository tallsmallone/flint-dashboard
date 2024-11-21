export interface HouseholdItem {
  _id?: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: Date;
  notes?: string;
}
