import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${window.location.origin}/api/trpc`,
      transformer: superjson,
      async fetch(input, init) {
        const doFetch = (target: RequestInfo | URL) => globalThis.fetch(target, {
          ...(init ?? {}),
          credentials: "include",
        });

        const primary = await doFetch(input);
        const contentType = primary.headers.get("content-type") || "";

        // Some deployments may route /api/trpc to index.html fallback.
        // If HTML is returned, retry against /trpc as compatibility fallback.
        if (contentType.includes("text/html") && typeof window !== "undefined") {
          const original = typeof input === "string" ? input : (input as Request).url;
          const retried = original.replace("/api/trpc", "/trpc");
          if (retried !== original) return doFetch(retried);
        }

        return primary;
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
