// @flow

/**
 */
export type TransactionInput = {
  prevout: Buffer,
  script: Buffer,
  sequence: Buffer,
  tree?: Buffer
};

/**
 */
export type TransactionOutput = {
  amount: Buffer /** value or amount commitment for liquid */,
  script: Buffer,
  assetCommitment?: Buffer /** asset commitment for liquid */,
  nonce?: Buffer /** ephemeral public key used in the range proof for this output for liquid */
};

/**
 */
export type Transaction = {
  version: Buffer,
  inputs: TransactionInput[],
  outputs?: TransactionOutput[],
  locktime?: Buffer,
  witness?: Buffer,
  timestamp?: Buffer,
  nVersionGroupId?: Buffer,
  nExpiryHeight?: Buffer,
  extraData?: Buffer,
  liquid?: boolean
};

/**
 */
export type LiquidOutput = {
  amount: Buffer /* cleartext amount */,
  asset: Buffer /* cleartext asset tag */,
  script: Buffer /* output script */,
  remoteBlindingKey: Buffer /* public remote blinding key */,
  nonce: Buffer /* ephemeral public key used in the range proof for this output */,
  abf?: Buffer /* external asset blinding factor to use for this output, only valid for the headless application */,
  assetCommitment?: Buffer /* external asset commitment, only provided if an external asset blinding factor is provided */,
  vbf?: Buffer /* external value blinding factor to use for this output, only valid for the headless application */,
  valueCommitment?: Buffer /* external value commitment, only provided if an external value blinding factor is provided */
};
