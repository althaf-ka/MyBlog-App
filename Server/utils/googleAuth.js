import OAuth2Client from "google-auth-library";

const Oauth = OAuth2Client.OAuth2Client;

const oAuth2Client = new Oauth({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

async function verifyToken(credential) {
  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const {
      sub: googleUserId,
      email: userEmail,
      name: userName,
      picture: profileLink,
    } = payload;

    return { googleUserId, userEmail, userName, profileLink };
  } catch (err) {
    console.error(err);
    throw new Error("Google Authentification Failed");
  }
}

export default verifyToken;
