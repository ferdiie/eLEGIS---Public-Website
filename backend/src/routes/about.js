import { Router } from "express";

export const aboutRouter = Router();

// FR-19: Display Office Information.
// The SRS recommends a small content/CMS table if this text is expected to
// change without a code deployment; for now it is maintained here as static
// content, matching the source mockup.
const ABOUT_CONTENT = {
  office_name: "Office of the Sangguniang Bayan",
  municipality: "Balilihan, Bohol",
  description:
    "The Sangguniang Bayan of Balilihan, Bohol is the official legislative body of the local government of the municipality, vested with the authority to formulate, review, and enact laws, ordinances, and resolutions that promote the welfare and development of its people. It is committed to upholding effective, transparent, and peaceful governance in pursuit of the sustainable progress of Balilihan.",
  tagline: "Serbisyong tinuoray, alang sa malinawong Balilihan.",
  mission:
    "To enact responsive, inclusive, and people-centered legislation that addresses the needs of every Balilinhanon, foster transparent and accountable governance, and actively engage the community in the legislative process for the common good.",
  vision:
    "A progressive and harmonious Balilihan governed by a principled, capable, and servant-hearted legislative body that upholds the rule of law, champions social equity, and drives sustainable development for present and future generations.",
};

aboutRouter.get("/", (req, res) => {
  res.json({ data: ABOUT_CONTENT });
});
