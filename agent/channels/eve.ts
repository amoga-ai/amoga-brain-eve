// The HTTP channel for AI chat. Signed sales-app users get their own memory; the Basic login still works for admin use.
import { httpBasic, localDev } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";
import { appUserAuth } from "../lib/app-user-auth.ts";

export default eveChannel({
  auth: [
    appUserAuth(),
    localDev(),
    httpBasic({
      username: process.env.EVE_USERNAME!,
      password: process.env.EVE_PASSWORD!,
    }),
  ],
});