require("dotenv").config();
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  console.error("GitHub OAuth credentials not found in environment variables");
  process.exit(1);
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          user.accessToken = accessToken;
          await user.save();
          return done(null, user);
        }

        user = new User({
          githubId: profile.id,
          username: profile.username || profile.login || "unknown",
          displayName:
            profile.displayName ||
            profile.name ||
            profile.username ||
            "Unknown User",
          email:
            profile.emails && profile.emails[0] ? profile.emails[0].value : "",
          avatarUrl:
            profile.photos && profile.photos[0] ? profile.photos[0].value : "",
          accessToken: accessToken,
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
