// @flow

export function getConfidentialDataSize(
  version: number,
  isValue?: boolean = false,
  isNullAccepted?: boolean = false
): number {
  switch (version) {
    case 0:
      if (!isNullAccepted) {
        throw new Error("Invalid null confidential data");
      }
      return 1;
    case 1:
      return isValue ? 9 : 33;
    case 2:
    case 3:
    case 8:
    case 9:
    case 10:
    case 11:
      return 33;
  }

  throw new Error("Unsupported confidential data version");
}
