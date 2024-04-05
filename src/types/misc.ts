type EnumTypes = {
  OrderStatus: {
    Confirmed: string;
    Pending: string;
    Shipped: string;
    Delivered: string;
    Cancelled: string;
  };
};

export const enums: EnumTypes = {
  OrderStatus: {
    Confirmed: "confirmed",
    Pending: "pending",
    Shipped: "shipped",
    Delivered: "delivered",
    Cancelled: "cancelled",
  },
};
