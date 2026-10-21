import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/user.model.js";

/** Shape a Clerk user resource into our User document fields. */
function buildProfile(clerkUser) {
  const email =
    clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses?.[0]?.emailAddress;

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email?.split("@")[0];

  return {
    clerkId: clerkUser.id,
    email,
    fullName,
    profilePic: clerkUser.imageUrl || "",
  };
}

export async function authMiddleware(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let user = await User.findOne({ clerkId: userId });

    // First login (or webhook not configured yet): sync the profile from
    // Clerk so the app works without waiting for user.created events.
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const profile = buildProfile(clerkUser);

      if (!profile.email || !profile.fullName) {
        res.status(404).json({ message: "User profile is not synced yet" });
        return;
      }

      user = await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: profile },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

      console.log(`Synced Clerk user ${userId} into MongoDB`);
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in auth middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
