import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/",
  method: "GET",
  handler: httpAction(async () => {
    return new Response("Hello World from Convex!", { status: 200 });
  }),
});

http.route({
  path: "/posts",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const posts = await ctx.runQuery(api.posts.list);
    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
