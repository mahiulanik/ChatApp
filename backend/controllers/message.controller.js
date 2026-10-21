import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { uploadChatMedia } from "../config/cloudinary.js";
import { getReceiverSocketId, getIO } from "../config/socket.js";

export async function getUsersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-clerkId");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId },
              ],
            },
            // Skip messages I deleted for myself — the other user keeps theirs.
            { deletedFor: { $ne: loggedInUserId } },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessageAt: { $max: "$createdAt" },
          // Messages I received that have never been opened.
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", loggedInUserId] },
                    { $eq: [{ $ifNull: ["$readAt", null] }, null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $replaceRoot: { newRoot: { $mergeObjects: ["$user", { unreadCount: "$unreadCount", lastMessageAt: "$lastMessageAt" }] } } },
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $and: [
        {
          $or: [
            { senderId: myId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: myId },
          ],
        },
        // Hidden from anyone who deleted this conversation for themselves.
        { deletedFor: { $ne: myId } },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/** Soft-delete: hide every message of this chat from MY side only. */
export async function deleteConversationForMe(req, res) {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    // The other participant is untouched — deletedFor only ever holds MY id.
    const result = await Message.updateMany(
      {
        $or: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      },
      { $addToSet: { deletedFor: myId } },
    );

    res.status(200).json({ deletedForMe: result.modifiedCount });
  } catch (error) {
    console.error("Error in deleteConversationForMe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/** Mark every message the other user sent me as read (their chat was opened). */
export async function markConversationRead(req, res) {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    const result = await Message.updateMany(
      { senderId: otherUserId, receiverId: myId, readAt: null },
      { $set: { readAt: new Date() } },
    );

    res.status(200).json({ markedRead: result.modifiedCount });
  } catch (error) {
    console.error("Error in markConversationRead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text?.trim() && !req.file) {
      return res.status(400).json({
        message: "Message text or media is required",
      });
    }

    const receiver = await User.exists({ _id: receiverId });

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    let media = null;

    if (req.file) {
      media = await uploadChatMedia(req.file, req.user);
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text?.trim() || "",
      ...(media && {
        media: {
          url: media.url,
          publicId: media.publicId,
          resourceType: media.resourceType,
          mimeType: req.file.mimetype,
        },
      }),
    });

    const receiverSocketId = getReceiverSocketId(String(receiverId));

    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}