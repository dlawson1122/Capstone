import mongoose from "mongoose";

const AdviceSchema = new mongoose.Schema(
  {
    penName: { type: String, default: "" }, // optional
    hurdle: { type: String, required: true, trim: true },
    learned: { type: String, required: true, trim: true },
    helps: { type: String, required: true, trim: true },
    advice: { type: String, required: true, trim: true },
    mood: { type: String, default: "" }, // optional
    tags: { type: [String], default: [] }, // optional
    helpfulCount: { type: Number, default: 0 } // for 👍 clicks later
  },
  { timestamps: true }
);

// collection will be "adviceentries"
export default mongoose.models.adviceEntry ||
  mongoose.model("adviceEntry", AdviceSchema, "adviceentries");
