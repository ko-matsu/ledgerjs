// @flow
import type { Transaction } from "./types";
import { getVarint } from "./varint";
import { getConfidentialDataSize } from "./elements";

export function splitTransaction(
  transactionHex: string,
  isSegwitSupported: ?boolean = false,
  hasTimestamp?: boolean = false,
  hasExtraData?: boolean = false,
  additionals: Array<string> = []
): Transaction {
  const inputs = [];
  const outputs = [];
  var witness = false;
  let offset = 0;
  let timestamp = Buffer.alloc(0);
  let nExpiryHeight = Buffer.alloc(0);
  let nVersionGroupId = Buffer.alloc(0);
  let extraData = Buffer.alloc(0);
  const isDecred = additionals.includes("decred");
  const isLiquid = additionals.includes("liquid");
  const transaction = Buffer.from(transactionHex, "hex");
  const version = transaction.slice(offset, offset + 4);
  const overwinter =
    version.equals(Buffer.from([0x03, 0x00, 0x00, 0x80])) ||
    version.equals(Buffer.from([0x04, 0x00, 0x00, 0x80]));
  offset += 4;
  if (isLiquid) {
    if (transaction[offset] !== 1) {
      throw new Error("splitTransaction: unsupported Liquid version");
    }
    offset++;
    witness = true;
  } else if (
    !hasTimestamp &&
    isSegwitSupported &&
    transaction[offset] === 0 &&
    transaction[offset + 1] !== 0
  ) {
    offset += 2;
    witness = true;
  }
  if (hasTimestamp) {
    timestamp = transaction.slice(offset, 4 + offset);
    offset += 4;
  }
  if (overwinter) {
    nVersionGroupId = transaction.slice(offset, 4 + offset);
    offset += 4;
  }
  let varint = getVarint(transaction, offset);
  const numberInputs = varint[0];
  offset += varint[1];
  for (let i = 0; i < numberInputs; i++) {
    const prevout = transaction.slice(offset, offset + 36);
    offset += 36;
    let script = Buffer.alloc(0);
    let tree = Buffer.alloc(0);
    let nonce = Buffer.alloc(0);
    let entropy = Buffer.alloc(0);
    let issuanceAmount = Buffer.alloc(0);
    let inflationKeys = Buffer.alloc(0);    
    //No script for decred, it has a witness
    if (!isDecred) {
      varint = getVarint(transaction, offset);
      offset += varint[1];
      script = transaction.slice(offset, offset + varint[0]);
      offset += varint[0];
    } else {
      //Tree field
      tree = transaction.slice(offset, offset + 1);
      offset += 1;
    }
    const sequence = transaction.slice(offset, offset + 4);
    offset += 4;
    if (isLiquid && ((prevout[35] & 0x80) != 0)) {
      prevout[35] &= 0x7f;
      nonce = transaction.slice(offset, offset + 32);
      offset += 32;
      entropy = transaction.slice(offset, offset + 32);
      offset += 32;
      let size = getConfidentialDataSize(transaction[offset], true, false);
      issuanceAmount = transaction.slice(offset, offset + size);
      offset += size;
      size = getConfidentialDataSize(transaction[offset], true, true);
      inflationKeys = transaction.slice(offset, offset + size);
      offset += size;
    }
    inputs.push({ prevout, script, sequence, tree, nonce, entropy, issuanceAmount, inflationKeys });
  }
  varint = getVarint(transaction, offset);
  const numberOutputs = varint[0];
  offset += varint[1];
  for (let i = 0; i < numberOutputs; i++) {
    let amount;
    let assetCommitment, nonce;
    if (isLiquid) {
      let size = getConfidentialDataSize(transaction[offset]);
      assetCommitment = transaction.slice(offset, offset + size);
      offset += size;
      size = getConfidentialDataSize(transaction[offset], true);
      amount = transaction.slice(offset, offset + size);
      offset += size;
      size = getConfidentialDataSize(transaction[offset], false, true);
      nonce = transaction.slice(offset, offset + size);
      offset += size;
    } else {
      amount = transaction.slice(offset, offset + 8);
      offset += 8;
    }

    if (isDecred) {
      //Script version
      offset += 2;
    }

    varint = getVarint(transaction, offset);
    offset += varint[1];
    const script = transaction.slice(offset, offset + varint[0]);
    offset += varint[0];
    if (isLiquid) {
      outputs.push({
        undefined,
        script,
        assetCommitment,
        amount,
        nonce
      });
    } else {
      outputs.push({ amount, script });
    }
  }
  let witnessScript, locktime;
  if (witness) {
    if (isLiquid) {
      witnessScript = transaction.slice(offset + 4);
      locktime = transaction.slice(offset, offset + 4);
    } else {
      witnessScript = transaction.slice(offset, -4);
      locktime = transaction.slice(transaction.length - 4);
    }
  } else {
    locktime = transaction.slice(offset, offset + 4);
  }
  offset += 4;
  if (overwinter || isDecred) {
    nExpiryHeight = transaction.slice(offset, offset + 4);
    offset += 4;
  }
  if (hasExtraData) {
    extraData = transaction.slice(offset);
  }

  //Get witnesses for Decred
  if (isDecred) {
    varint = getVarint(transaction, offset);
    offset += varint[1];
    if (varint[0] !== numberInputs) {
      throw new Error("splitTransaction: incoherent number of witnesses");
    }
    for (let i = 0; i < numberInputs; i++) {
      //amount
      offset += 8;
      //block height
      offset += 4;
      //block index
      offset += 4;
      //Script size
      varint = getVarint(transaction, offset);
      offset += varint[1];
      const script = transaction.slice(offset, offset + varint[0]);
      offset += varint[0];
      inputs[i].script = script;
    }
  }

  return {
    version,
    inputs,
    outputs,
    locktime,
    witness: witnessScript,
    timestamp,
    nVersionGroupId,
    nExpiryHeight,
    extraData,
    liquid: isLiquid
  };
}
