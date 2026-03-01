import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { fileRouter } from "./_core/fileRouter";
import { blogRouter } from "./blogRouter";
import { elAnalisisRouter } from "./routes/el-analisis";
import { timeRouter } from "./routers/time";
import { bcapiRouter } from "./routers/bcapi";
import { partiesRouter } from "./routers/parties";

export const appRouter = router({
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

  files: fileRouter,
  blog: blogRouter,
  elAnalisis: elAnalisisRouter,
  time: timeRouter,
  bcapi: bcapiRouter,
  parties: partiesRouter,
});

export type AppRouter = typeof appRouter;
