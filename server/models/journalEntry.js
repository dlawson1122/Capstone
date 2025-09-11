import mongoose from "mongoose";

// define the schema for a journal entry
const journalEntrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxLength: 140 },
    body: { type: String, required: true },
    mood: { type: String, enum: ["🌞", "🙂", "😐", "🙁", "🌧️"], default: "😐" }
  },
  { timestamps: true } // adds timestamp
);

// export the model using the same name style
// "journalEntry" → Mongoose will pluralize it to "journalentries"
export default mongoose.model("journalEntry", journalEntrySchema);
