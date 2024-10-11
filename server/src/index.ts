import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { verifyEmailInput, checkEmailAvailability } from "./email";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.use(cookieParser())

app.get("/", async (request: Request, response: Response) => {
	console.log( request.cookies['cookieName'] );
  console.log((process.env.NODE_ENV || "development") !== "development");

  response.status(200).send("Hello World");
});

app.get("/email/verify", async (request, response) => {
	const email = request.query.email;
	if (typeof email !== "string" || !verifyEmailInput(email)) {
		response.status(400).send("Invalid email");
		return;
	}
	const available = await checkEmailAvailability(email);
	response.status(200).send(available);
});

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
  // gracefully handle error
  throw new Error(error.message);
});
