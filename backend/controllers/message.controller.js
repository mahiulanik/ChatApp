import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { uploadChatMedia } from "../config/cloudinary.js";
import { getIO } from "../config/socket.js";

const conversationFilter = (myId, otherId) => ({
    $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId }
    ]
});

export async function getUsersForSidebar(req, res) {
    try {
        const users = await User.find({
            _id: { $ne: req.user._id }
        }).select("-clerkId").lean();

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getConversationsForSidebar(req, res) {
    try {
        const myId = req.user._id;

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: myId },
                        { receiverId: myId }
                    ],
                    deletedFor: { $ne: myId }
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", myId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessageAt: { $max: "$createdAt" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiverId", myId] },
                                        { $eq: [{ $ifNull: ["$readAt", null] }, null] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { lastMessageAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            "$user",
                            {
                                unreadCount: "$unreadCount",
                                lastMessageAt: "$lastMessageAt"
                            }
                        ]
                    }
                }
            },
            { $project: { clerkId: 0 } }
        ]);

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error in getConversationsForSidebar:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMessages(req, res) {
    try {
        const { id } = req.params;
        const myId = req.user._id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const messages = await Message.find({
            ...conversationFilter(myId, id),
            deletedFor: { $ne: myId }
        }).sort({ createdAt: 1 }).lean();

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteConversationForMe(req, res) {
    try {
        const { id } = req.params;
        const myId = req.user._id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const result = await Message.updateMany(
            conversationFilter(myId, id),
            { $addToSet: { deletedFor: myId } }
        );

        res.status(200).json({ deletedForMe: result.modifiedCount });
    } catch (error) {
        console.error("Error in deleteConversationForMe:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function markConversationRead(req, res) {
    try {
        const { id } = req.params;
        const myId = req.user._id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const result = await Message.updateMany(
            {
                senderId: id,
                receiverId: myId,
                readAt: null
            },
            { $set: { readAt: new Date() } }
        );

        res.status(200).json({ markedRead: result.modifiedCount });
    } catch (error) {
        console.error("Error in markConversationRead:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function sendMessage(req, res) {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        const text = req.body.text?.trim() || "";

        if (!mongoose.isValidObjectId(receiverId)) {
            return res.status(400).json({ message: "Invalid receiver ID" });
        }

        if (!text && !req.file) {
            return res.status(400).json({
                message: "Message text or media is required"
            });
        }

        const receiver = await User.exists({ _id: receiverId });

        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        const media = req.file
            ? await uploadChatMedia(req.file, req.user)
            : null;

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            ...(media && {
                media: {
                    ...media,
                    mimeType: req.file.mimetype
                }
            })
        });

        getIO().to(`user:${receiverId}`).emit("newMessage", newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
