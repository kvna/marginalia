import { describe, expect, it } from "vitest";
import { appName } from "../src/placeholder";

describe("appName", () => {
  it("returns the project name", () => {
    expect(appName()).toBe("marginalia");
  });
});
