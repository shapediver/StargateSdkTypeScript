/** Contains all error types that are used by the ShapeDiver core-package. */
export const SdStargateCoreErrorTypes = {
  /** Generic error in this client. */
  GenericClientError: "GenericClient",

  /** The server is not ready to handle the request. */
  ServiceUnavailable: "ServiceUnavailable",
};
export type SdStargateCoreErrorTypes =
  (typeof SdStargateCoreErrorTypes)[keyof typeof SdStargateCoreErrorTypes];
