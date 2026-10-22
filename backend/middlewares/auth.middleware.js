import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/user.model.js";

function buildProfile(clerkUser) {
    const email =
        clerkUser.emailAddresses?.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;

    const fullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        email?.split("@")[0];

    return {
        clerkId: clerkUser.id,
        email,
        fullName,
        profilePic: clerkUser.imageUrl || ""
    };
}

export async function authMiddleware(req, res, next) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let user = await User.findOne({ clerkId: userId });

        if (!user) {
            const clerkUser = await clerkClient.users.getUser(userId);
            const profile = buildProfile(clerkUser);

            if (!profile.email || !profile.fullName) {
                return res.status(404).json({
                    message: "User profile is not synced yet"
                });
            }

            user = await User.findOneAndUpdate(
                { clerkId: userId },
                { $set: profile },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
