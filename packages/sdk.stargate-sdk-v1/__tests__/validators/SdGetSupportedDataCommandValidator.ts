import {
  ISdStargateGetSupportedDataCommandDto,
  ISdStargateGetSupportedDataReplyDto,
  SdStargateError,
} from "../../src";
import { SdGetSupportedDataCommandValidator } from "../../src/validators/commands/SdGetSupportedDataCommandValidator";

describe("validate get supported data command", function () {
  describe("command dto", function () {
    test("full", () => {
      let data: Required<ISdStargateGetSupportedDataCommandDto> = {};
      SdGetSupportedDataCommandValidator.assertCommandDto(data);
    });
  });

  describe("reply dto", function () {
    test("full", () => {
      let data: Required<ISdStargateGetSupportedDataReplyDto> = {
        parameterTypes: ["foo", "bar"],
        typeHints: ["baz", "qux"],
      };
      SdGetSupportedDataCommandValidator.assertReplyDto(data);
    });

    test("parameterTypes missing", () => {
      try {
        let data = {
          typeHints: ["baz", "qux"],
        };
        SdGetSupportedDataCommandValidator.assertReplyDto(data);
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e instanceof SdStargateError).toBeTruthy();
      }
    });

    test("typeHints missing", () => {
      try {
        let data = {
          parameterTypes: ["foo", "bar"],
        };
        SdGetSupportedDataCommandValidator.assertReplyDto(data);
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e instanceof SdStargateError).toBeTruthy();
      }
    });

    test("parameterTypes wrong type", () => {
      try {
        let data = {
          parameterTypes: [1],
          typeHints: ["baz", "qux"],
        };
        SdGetSupportedDataCommandValidator.assertReplyDto(data);
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e instanceof SdStargateError).toBeTruthy();
      }
    });

    test("typeHints wrong type", () => {
      try {
        let data = {
          parameterTypes: ["foo", "bar"],
          typeHints: [1],
        };
        SdGetSupportedDataCommandValidator.assertReplyDto(data);
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e instanceof SdStargateError).toBeTruthy();
      }
    });
  });
});
