// @flow
import Transport from "@ledgerhq/hw-transport";
import { MAX_SCRIPT_BLOCK } from "./constants";
import type { LiquidOutputArg } from "./createLiquidTransaction";
import { createVarint } from "./varint";

export async function hashOutputFullLiquid(
  transport: Transport<*>,
  outputs: Array<LiquidOutputArg>
): Promise<void> {
  await transport.send(0xe0, 0x4a, 0x00, 0x00, createVarint(outputs.length));
  let currentOutput = 0;

  for (let i=0; i<outputs.length; i++) {
    let offset = 0;
    let output = outputs[i];

    await transport.send(0xe0, 0x4a, 0x00, 0x00, output.assetValueCommitments);
    await transport.send(0xe0, 0x4a, 0x00, 0x00, output.nonce);
    if (typeof output.remoteBlindingKey !== "undefined") {
      await transport.send(0xe0, 0x4a, 0x00, 0x00, output.remoteBlindingKey);
    }

    let script = Buffer.concat([createVarint(output.script.length), output.script]);    

    while (offset < script.length) {
      let blockSize =
        offset + MAX_SCRIPT_BLOCK >= script.length
          ? script.length - offset
          : MAX_SCRIPT_BLOCK;
      let p1 = offset + blockSize === script.length ? (i == outputs.length - 1 ? 0x80 : 0x00) : 0x00;
      let data = script.slice(offset, offset + blockSize);
      await transport.send(0xe0, 0x4a, p1, 0x00, data);
      offset += blockSize;
    }
  }
}
