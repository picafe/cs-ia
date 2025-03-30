import { Hono } from "hono";
import { auth } from "./lib/auth"; // path to your auth file
import { cors } from "hono/cors";

const app = new Hono()

app.use(
	"*",
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default { 
  port: 3000, 
  fetch: app.fetch, 
} 
