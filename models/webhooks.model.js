const { model, Schema } = require('mongoose');


const webhookSchema = new Schema(
  {
    activities: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = model("webhookModel", webhookSchema);
