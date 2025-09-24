// CRUD Controller
import { Router } from "express";
import AdviceEntry from "../models/adviceEntry.js";

const router = Router();

// POST /api/advice
router.post("/", async (request, response) => {
  try {
    const { penName, hurdle, learned, helps, advice, mood, tags } = request.body;

    const newAdvice = await AdviceEntry.create({
      penName: penName ?? "",
      hurdle: hurdle ?? "",
      learned: learned ?? "",
      helps: helps ?? "",
      advice: advice ?? "",
      mood: mood ?? "",
      tags: Array.isArray(tags) ? tags : []
    });

    response.status(201).json(newAdvice); // 201 = created
  } catch (error) {
    console.error("Create error:", error);
    response.status(500).json({ error: "Failed to create advice" });
  }
});


// GET /api/advice
router.get("/", async (_request, response) => {
  try {
    const adviceList = await AdviceEntry.find().sort({ createdAt: -1 }).limit(50);
    response.json(adviceList);
  } catch (error) {
    console.error("Read all error:", error);
    response.status(500).json({ error: "Failed to fetch advice" });
  }
});


// GET /api/advice/:id
router.get("/:id", async (request, response) => {
  try {
    const advice = await AdviceEntry.findById(request.params.id);
    if (!advice) return response.status(404).json({ error: "Not found" });
    response.json(advice);
  } catch (error) {
    console.error("Read one error:", error);
    response.status(400).json({ error: "Invalid ID" });
  }
});

// POST /api/advice/:id/helpful  (CRUD: partial update – increment)
router.post("/:id/helpful", async (request, response) => {
  try {
    const updated = await AdviceEntry.findByIdAndUpdate(
      request.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!updated) return response.status(404).json({ error: "Not found" });
    response.json(updated);
  } catch (error) {
    console.error("Helpful error:", error);
    response.status(400).json({ error: "Invalid ID" });
  }
});


// PUT /api/advice/:id
router.put("/:id", async (request, response) => {
  try {
    const body = request.body;

    const updatedAdvice = await AdviceEntry.findByIdAndUpdate(
      request.params.id,
      {
        $set: {
          penName: body.penName,
          hurdle: body.hurdle,
          learned: body.learned,
          helps: body.helps,
          advice: body.advice,
          mood: body.mood,
          tags: body.tags
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedAdvice) return response.status(404).json({ error: "Not found" });
    response.json(updatedAdvice);
  } catch (error) {
    console.error("Update error:", error);
    response.status(500).json({ error: "Failed to update advice" });
  }
});


// DELETE /api/advice/:id
router.delete("/:id", async (request, response) => {
  try {
    const deletedAdvice = await AdviceEntry.findByIdAndDelete(request.params.id);
    if (!deletedAdvice) return response.status(404).json({ error: "Not found" });
    response.json({ message: "Advice deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    response.status(500).json({ error: "Failed to delete advice" });
  }
});


export default router;
