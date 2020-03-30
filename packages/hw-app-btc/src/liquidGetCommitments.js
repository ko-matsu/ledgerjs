// @flow
import Transport from "@ledgerhq/hw-transport";

export async function liquidGetCommitments(
  transport: Transport<*>,
  assetTag: Buffer,
  value: Buffer,
  outputIndex: Number,
  vbfUser?: Buffer,
  abfUser?: Buffer
): Promise<{
  abf: Buffer,
  vbf: Buffer,
  commitment: Buffer
}> {
  let p1 = 0x00;
  if (typeof vbfUser != "undefined") {
    p1 = 0x02;
  }
  if (typeof abfUser != "undefined" && typeof vbfUser != "undefined") {
    p1 = 0x03;
  }

  let indexBuffer = Buffer.alloc(4);
  indexBuffer.writeUInt32BE(outputIndex, 0);

  let data = Buffer.concat([assetTag, value, indexBuffer]);
  if (typeof vbfUser != "undefined") {
    data = Buffer.concat([data, vbfUser]);
  }
  if (typeof abfUser != "undefined") {
    data = Buffer.concat([data, abfUser]);
  }

  const response = await transport.send(0xe0, 0xe0, p1, 0x00, data);

  const abf = response.slice(0, 32);
  const vbf = response.slice(32, 32 + 32);
  const commitment = response.slice(32 + 32, -2);

  return { abf, vbf, commitment };
}
