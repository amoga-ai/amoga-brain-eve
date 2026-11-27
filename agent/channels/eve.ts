// The HTTP channel for AI chat. Local development needs no login; everywhere else, requests need the Basic username and password.
import { httpBasic, localDev } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

export default eveChannel({
  auth: [
    localDev(),
    httpBasic({
      username: process.env.EVE_USERNAME!,
      password: process.env.EVE_PASSWORD!,
    }),
  ],
});
