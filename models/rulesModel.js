import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    spaceId: {
      type: mongoose.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    spaceName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Rule = mongoose.model("Rule", ruleSchema);

export default Rule;
