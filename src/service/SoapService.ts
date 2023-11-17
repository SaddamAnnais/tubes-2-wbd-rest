import axios from "axios";
import xml2js from "xml2js";
import { SoapConfig } from "../config/soap-config";

export class SoapService {
  async getStatus(creatorId: number, subscriberId: number) {
    try {
      const response = await axios.post<string>(
        `http://host.docker.internal:8001/api/subscribe`,
        `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
          <Body>
            <getStatus xmlns="http://service.cooklyst/">
              <arg0 xmlns="">${SoapConfig.key}</arg0>
              <arg1 xmlns="">${creatorId}</arg1>
              <arg2 xmlns="">${subscriberId}</arg2>
            </getStatus>
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
        parsed["S:Envelope"]["S:Body"][0]["ns2:getStatusResponse"][0].return[0];

      return result;
    } catch (err) {
      return null;
    }
  }
}
