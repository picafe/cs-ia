import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { hc } from 'hono/client';
import type { AppType } from '../../../backend/src/index';
import type { auth } from "../../../backend/src/lib/auth";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: "http://localhost:3000/api/auth",
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const client = hc<AppType>('http://localhost:3000/', {
  'init': {
    'credentials': 'include',
  }
});


