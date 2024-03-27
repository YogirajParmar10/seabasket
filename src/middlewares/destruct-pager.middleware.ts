import { TRequest, TResponse } from "@types";
import { Constants } from "../configs/constants";

export function destructPager(req: TRequest, _: TResponse, next: () => void) {
  const { page = Constants.PAGER.page, limit = Constants.PAGER.limit } = req.query as any;

  req.pager = {
    page: +page,
    limit: +limit,
  };
  next();
}
