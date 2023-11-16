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

export interface ProRequest {
  requesterID: number;
}

export interface UserSubs {
  id: number;
  username: string;
  name: string;
  subsStatus: string;
}
