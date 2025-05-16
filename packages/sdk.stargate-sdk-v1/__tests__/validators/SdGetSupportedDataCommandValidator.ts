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
    const validReplyDto: Required<ISdStargateGetSupportedDataReplyDto> = {
      parameterTypes: ["foo", "bar"],
      typeHints: ["baz", "qux"],
      contentTypes: ["application/dwg"],
      fileExtensions: ["dwg"],
    };

    test("full - latest version", () => {
      expect(() =>
        SdGetSupportedDataCommandValidator.assertReplyDto(validReplyDto)
      ).not.toThrow();
    });

    test("legacy (v1.5.0) missing newer properties", () => {
      // Only required properties are present, simulating an older reply DTO.
      const legacyReplyDto = {
        parameterTypes: validReplyDto.parameterTypes,
        typeHints: validReplyDto.typeHints,
      };

      expect(() =>
        SdGetSupportedDataCommandValidator.assertReplyDto(legacyReplyDto)
      ).not.toThrow();
    });

    test.each([
      ["parameterTypes", { ...validReplyDto, parameterTypes: undefined }],
      ["typeHints", { ...validReplyDto, typeHints: undefined }],
      // Properties added later are optional and set later.
    ])("%s missing", (_, data) => {
      expect(() =>
        SdGetSupportedDataCommandValidator.assertReplyDto(data)
      ).toThrow(SdStargateError);
    });

    test.each([
      ["parameterTypes", { ...validReplyDto, parameterTypes: [1] }],
      ["typeHints", { ...validReplyDto, typeHints: [1] }],
      ["contentTypes", { ...validReplyDto, contentTypes: [1] }],
      ["fileExtensions", { ...validReplyDto, fileExtensions: [1] }],
    ])("%s wrong type", (_, data) => {
      expect(() =>
        SdGetSupportedDataCommandValidator.assertReplyDto(data)
      ).toThrow(SdStargateError);
    });
  });
});
