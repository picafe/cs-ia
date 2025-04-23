import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
 
const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {  
        enabled: true
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "STUDENT",
                input: false,
            },
            browserNotifications: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: true,
            },
            emailNotifications: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: true,
            },
        }
    },
    trustedOrigins: ["http://localhost:5173"]
});