export const ORDER_STATUSES = {
  AWAITING_PAYMENT: { label: "Awaiting Payment", color: "yellow" },
  PAYMENT_COMPLETE: { label: "Payment Complete", color: "green" },
  ORDER_COMPLETE: { label: "Order Complete", color: "emerald" },
  CANCELLED: { label: "Cancelled", color: "red" },
} as const

export const PAYMENT_METHODS = {
  VENMO: { label: "Venmo", icon: "venmo" },
  CASHAPP: { label: "Cash App", icon: "cashapp" },
  BITCOIN: { label: "Bitcoin", icon: "bitcoin" },
  STRIPE: { label: "Credit Card", icon: "credit-card" },
  CREDIT_CARD: { label: "Credit Card", icon: "credit-card" },
} as const

export const AFFILIATE_STATUSES = {
  PENDING: { label: "Pending", color: "yellow" },
  APPROVED: { label: "Approved", color: "green" },
  REJECTED: { label: "Rejected", color: "red" },
  SUSPENDED: { label: "Suspended", color: "gray" },
} as const

export const COMMISSION_STATUSES = {
  PENDING: { label: "Pending", color: "yellow" },
  APPROVED: { label: "Approved", color: "blue" },
  PAID: { label: "Paid", color: "green" },
  CANCELLED: { label: "Cancelled", color: "red" },
} as const

export const DEFAULT_COMMISSION_RATE = 10
export const DEFAULT_AFFILIATE_DISCOUNT_RATE = 10
export const DEFAULT_PARENT_COMMISSION_RATE = 5
export const AFFILIATE_COOKIE_DAYS = 30
export const ITEMS_PER_PAGE = 20

export const COMMISSION_TYPES = {
  DIRECT: { label: "Direct", color: "blue" },
  PARENT: { label: "Parent", color: "purple" },
} as const

export const DISCOUNT_TYPES = {
  PERCENTAGE: { label: "Percentage (%)" },
  FIXED_AMOUNT: { label: "Fixed Amount ($)" },
} as const
