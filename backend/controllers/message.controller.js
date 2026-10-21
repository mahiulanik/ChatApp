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
          $or: [
            { senderId: loggedInUserId },
            { receiverId: loggedInUserId },
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
      { $replaceRoot: { newRoot: "$user" } },
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
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
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