import { Request, Response } from "express";
import { createResponse } from "../util/create-response";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { SoapConfig } from "../config/soap-config";
import axios from "axios";
import xml2js from "xml2js";
import { Subscription, SubscriptionRequest } from "../type/subscription";

export class SoapController {
  async getAll(req: Request, res: Response) {
    if (!res.locals.isAdmin) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    try {
      const response = await axios.post<string>(
        `${SoapConfig.url}/api/subscribe`,
        `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
          <Body>
            <getPendingSubs xmlns="http://service.cooklyst/">
              <arg0 xmlns="">${SoapConfig.key}</arg0>
            </getPendingSubs>
          </Body>
        </Envelope>`,
        {
          headers: {
            "Content-Type": "text/xml",
          },
        }
      );

      const parsed = await xml2js.parseStringPromise(response.data);
      const results =
        parsed["S:Envelope"]["S:Body"][0]["ns2:getPendingSubsResponse"][0]
          .return;

      const formattedData: Subscription[] = [];
      results &&
        results.forEach((el: any) => {
          formattedData.push({
            creatorID: el.creatorID[0],
            status: el.status[0],
            subscriberEmail: el.subscriberEmail[0],
            subscriberID: el.subscriberID[0],
          });
        });
      createResponse(res, StatusCodes.OK, ReasonPhrases.OK, formattedData);
    } catch (err) {
      console.error(err);
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
    }
  }

  async reject(req: Request, res: Response) {
    if (!res.locals.isAdmin) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    const { creatorID, subscriberID }: SubscriptionRequest = req.body;

    if (!creatorID || !subscriberID) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field creatorID and subscriberID cannot be empty."
      );

      return;
    }

    try {
      const response = await axios.post<string>(
        `${SoapConfig.url}/api/subscribe`,
        `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
          <Body>
            <reject xmlns="http://service.cooklyst/">
              <arg0 xmlns="">${SoapConfig.key}</arg0>
              <arg1 xmlns="">${creatorID}</arg1>
              <arg2 xmlns="">${subscriberID}</arg2>
            </reject>
          </Body>
        </Envelope>`,
        {
          headers: {
            "Content-Type": "text/xml",
          },
        }
      );

      const parsed = await xml2js.parseStringPromise(response.data);
      const result =
        parsed["S:Envelope"]["S:Body"][0]["ns2:rejectResponse"][0].return[0];

      let statusCode = StatusCodes.BAD_REQUEST;
      if (result === "No subscription request found") {
        statusCode = StatusCodes.NOT_FOUND;
      } else if (result === "Successfully rejected subscription request") {
        statusCode = StatusCodes.OK;
      }
      createResponse(res, statusCode, result);
    } catch (err) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
    }
  }

  async approve(req: Request, res: Response) {
    if (!res.locals.isAdmin) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    const { creatorID, subscriberID }: SubscriptionRequest = req.body;

    if (!creatorID || !subscriberID) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field creatorID and subscriberID cannot be empty."
      );

      return;
    }

    try {
      const response = await axios.post<string>(
        `${SoapConfig.url}/api/subscribe`,
        `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
          <Body>
            <approve xmlns="http://service.cooklyst/">
              <arg0 xmlns="">${SoapConfig.key}</arg0>
              <arg1 xmlns="">${creatorID}</arg1>
              <arg2 xmlns="">${subscriberID}</arg2>
            </approve>
          </Body>
        </Envelope>`,
        {
          headers: {
            "Content-Type": "text/xml",
          },
        }
      );

      const parsed = await xml2js.parseStringPromise(response.data);
      const result =
        parsed["S:Envelope"]["S:Body"][0]["ns2:approveResponse"][0].return[0];

      let statusCode = StatusCodes.BAD_REQUEST;
      if (result === "No subscription request found") {
        statusCode = StatusCodes.NOT_FOUND;
      } else if (result === "Successfully rejected subscription request") {
        statusCode = StatusCodes.OK;
      }
      createResponse(res, statusCode, result);
    } catch (err) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
    }
  }
}
