import { describe, expect, it } from "vitest";
import { appRouter, quicktapStateSchema } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const validState = {
  sessions: [],
  playerScores: {},
  playerName: "Alex",
  totalRounds: 5,
  activeSessionId: "session-test",
};

describe("quicktap persistence", () => {
  it("rejects owner keys that are too short", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.quicktap.getState({ ownerKey: "short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("validates the structured state contract", () => {
    expect(quicktapStateSchema.safeParse(validState).success).toBe(true);
    expect(quicktapStateSchema.safeParse({ ...validState, totalRounds: 0 }).success).toBe(false);
  });

  it("rejects malformed structured state at the procedure boundary", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.quicktap.saveState({ ownerKey: "qt-test-owner-123456", state: { ...validState, totalRounds: 0 } })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

