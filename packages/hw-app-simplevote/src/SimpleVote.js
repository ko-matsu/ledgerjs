/********************************************************************************
 *   Ledger Node JS API
 *   (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/
//@flow

// FIXME drop:
import { foreach } from "./utils";
import type Transport from "@ledgerhq/hw-transport";
/**
 * SimpleVote API
 *
 * @example
 * import SimpleVote from "@ledgerhq/hw-app-simplevote";
 * const vote = new SimpleVote(transport)
 */
export default class SimpleVote {
  transport: Transport<*>;

  constructor(transport: Transport<*>, scrambleKey: string = "v0t") {
    this.transport = transport;
    transport.decorateAppAPIMethods(this, ["getVote"], scrambleKey);
  }

  /**
   * Send a vote to the application and collect the user answer, and return the hex data
   */
  getVote(voteDataHex: string): Promise<string> {
    let offset = 0;
    let voteData = Buffer.from(voteDataHex, "hex");
    let toSend = [];
    let response;
    while (offset !== voteData.length) {
      let maxChunkSize = 150;
      let chunkSize =
        offset + maxChunkSize > voteData.length
          ? voteData.length - offset
          : maxChunkSize;
      let buffer = Buffer.alloc(chunkSize);
      voteData.copy(buffer, 0, offset, offset + chunkSize);
      toSend.push(buffer);
      offset += chunkSize;
    }
    return foreach(toSend, (data, i) =>
      this.transport
        .send(0xe0, 0x02, i === 0 ? 0x00 : 0x80, 0x00, data)
        .then((apduResponse) => {
          response = apduResponse;
        })
    ).then(() => {
      return response.slice(0, response.length - 2).toString("hex");
    });
  }
}
