import { Request, Response } from "express";

export interface UserInfo {
  id: number;
}
export interface TRequest<T = any> extends Request {
  req: any;
  params: {
    orderId: any;
    category: any;
    productId: any;
    token: any;
  };
  headers: any;
  user?: UserInfo;
  dto?: T;
  t: (key: string, opts?: any) => string;
}

export interface TResponse extends Response {
  status: any;
}
