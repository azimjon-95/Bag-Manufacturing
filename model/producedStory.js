const { Schema, model } = require("mongoose");

const ProducedStorySchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "ProductNorma",
  },
  productNormaId: {
    type: Schema.Types.ObjectId,
    ref: "ProductNorma",
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = model("ProducedStory", ProducedStorySchema);
