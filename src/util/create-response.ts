import { Response } from "express";

export function createResponse(
  res: Response,
  status: number,
  message: string,
  data?: any
) {
  const statusBoolean = status >= 200 && status < 300;
  data
    ? res
        .status(status)
        .json({ status: statusBoolean, message: message, data: data })
    : res.status(status).json({ status: statusBoolean, message: message });
}
