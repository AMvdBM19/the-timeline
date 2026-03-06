const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema must be named FEED
const FEEDSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      maxlength: [15, 'Name must be no longer than 15 characters'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [40, 'Message must be no longer than 40 characters'],
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FEED', FEEDSchema);

