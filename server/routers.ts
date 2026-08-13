import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { deleteQuicktapState, getQuicktapState, upsertQuicktapState } from "./db";
import { z } from "zod";

const quicktapSessionSchema = z.object({
  sessionId: z.string().min(1).max(128),
  date: z.string().min(1).max(128),
  players: z.number().int().nonnegative(),
  best: z.number().int().nonnegative(),
  winner: z.string().max(128),
  round: z.number().int().positive().optional(),
});

export const quicktapStateSchema = z.object({
  sessions: z.array(quicktapSessionSchema).max(10_000),
  playerScores: z.record(z.string().max(128), z.object({ best: z.number().int().nonnegative(), total: z.number().int().nonnegative(), rounds: z.number().int().nonnegative() })).refine((value) => Object.keys(value).length <= 1_000),
  playerName: z.string().max(128),
  totalRounds: z.number().int().positive().max(100),
  activeSessionId: z.string().min(1).max(128),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quicktap: router({
    getState: publicProcedure.input(z.object({ ownerKey: z.string().min(16).max(128) })).query(async ({ input }) => {
      const state = await getQuicktapState(input.ownerKey);
      if (!state) return null;
      const parsed = quicktapStateSchema.safeParse(JSON.parse(state.payload));
      return parsed.success ? { state: parsed.data, updatedAt: state.updatedAt } : null;
    }),
    saveState: publicProcedure.input(z.object({ ownerKey: z.string().min(16).max(128), state: quicktapStateSchema })).mutation(async ({ input }) => {
      const state = await upsertQuicktapState({ ownerKey: input.ownerKey, payload: JSON.stringify(input.state) });
      return state ? { state: input.state, updatedAt: state.updatedAt } : { state: input.state, updatedAt: new Date() };
    }),
    deleteState: publicProcedure.input(z.object({ ownerKey: z.string().min(16).max(128) })).mutation(async ({ input }) => ({ success: await deleteQuicktapState(input.ownerKey) })),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
