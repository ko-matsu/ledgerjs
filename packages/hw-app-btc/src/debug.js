// @flow
import type { Transaction } from "./types";

export function displayTransactionDebug(transaction: Transaction) {
  console.log("version " + transaction.version.toString("hex"));
  transaction.inputs.forEach((input, i) => {
    const prevout = input.prevout.toString("hex");
    const script = input.script.toString("hex");
    const sequence = input.sequence.toString("hex");
    console.log(
      `input ${i} prevout ${prevout} script ${script} sequence ${sequence}`
    );
    if (transaction.liquid && (input.nonce.length != 0) && (input.entropy.length != 0)) {
      const nonce = input.nonce.toString("hex");
      const entropy = input.entropy.toString("hex");
      const issuanceAmount = input.issuanceAmount.toString("hex");
      const inflationKeys = input.inflationKeys.toString("hex");      
      console.log(
        `input ${i} nonce ${nonce} entropy ${entropy} issuance amount ${issuanceAmount} inflation keys ${inflationKeys}`
      );
    }
  });
  (transaction.outputs || []).forEach((output, i) => {
    if (transaction.liquid) {
      const assetCommitment = output.assetCommitment.toString("hex");
      const valueCommitment = output.amount.toString("hex");
      const nonce = output.nonce.toString("hex");
      const script = output.script.toString("hex");
      console.log(
        `output ${i} assetCommitment ${assetCommitment} valueCommitment ${valueCommitment} nonce ${nonce} script ${script}`
      );
    } else {
      const amount = output.amount.toString("hex");
      const script = output.script.toString("hex");
      console.log(`output ${i} amount ${amount} script ${script}`);
    }
  });
  if (typeof transaction.locktime !== "undefined") {
    console.log("locktime " + transaction.locktime.toString("hex"));
  }
}
