import { SdStargateError, SdStargateErrorTypes } from "../src/SdStargateError";
import { isSgError } from "../src/utils";

describe("isSgError", function () {
  test.each(Object.values(SdStargateErrorTypes))(
    "%s; should be truthy",
    (type: any) => {
      expect(isSgError(new SdStargateError(type, ""))).toBeTruthy();
    }
  );

  test.each([
    ["JS-error", new Error("")],
    ["SdStargateError", new SdStargateError("foobar", "")],
    ["object", { type: "foo", message: "" }],
  ])("%s; should be falsy", (_, error) => {
    expect(isSgError(error)).toBeFalsy();
  });
});
