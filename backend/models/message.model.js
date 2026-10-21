import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    media: {
      url: String,
      publicId: String,
      resourceType: {
        type: String,
        enum: ["image", "video"],
      },
      mimeType: String,
    },
    // Set when the receiver opens the conversation; null = still unread.
    readAt: {
      type: Date,
      default: null,
    },
    // Users who deleted this chat from THEIR view only (soft per-user delete).
    deletedFor: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;