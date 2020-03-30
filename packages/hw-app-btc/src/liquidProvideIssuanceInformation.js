// @flow
import Transport from "@ledgerhq/hw-transport";
import { MAX_SCRIPT_BLOCK } from "./constants";

export async function liquidProvideIssuanceInformation(
  transport: Transport<*>,
  issuanceInformation: Buffer
): Promise<void> {
  let offset = 0;

  while (offset < issuanceInformation.length) {
    let blockSize =
      offset + MAX_SCRIPT_BLOCK >= issuanceInformation.length
        ? issuanceInformation.length - offset
        : MAX_SCRIPT_BLOCK;
    let p1 = offset + blockSize === issuanceInformation.length ? 0x80 : 0x00;
    let data = issuanceInformation.slice(offset, offset + blockSize);
    await transport.send(0xe0, 0xe6, p1, 0x00, data);
    offset += blockSize;
  }
}
