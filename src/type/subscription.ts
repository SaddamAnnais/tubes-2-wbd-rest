export interface Subscription {
  creatorID: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  subscriberEmail: string;
  subscriberID: number;
}

export interface SubscriptionRequest {
  subscriberID: number;
  creatorID: number;
}
