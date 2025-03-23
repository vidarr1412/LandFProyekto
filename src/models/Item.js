const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  FINDER: String, 
  FINDER_TYPE: String, 
  ITEM: String, 
  ITEM_TYPE: String,
  DESCRIPTION: String,
  IMAGE_URL: String,
  CONTACT_OF_THE_FINDER: String,
  DATE_FOUND: String,
  GENERAL_LOCATION: String,
  FOUND_LOCATION: String,
  TIME_RETURNED: String,
  OWNER: String,
  OWNER_COLLEGE: String,
  OWNER_CONTACT: String,
  OWNER_IMAGE: String,
  DATE_CLAIMED: String,
  TIME_CLAIMED: String,
  STATUS: String,
  POST_ID: String,
  DURATION: Number, // ⬅️ NEW FIELD FOR TIME TAKEN
  foundation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Foundation',
    default: null
  }
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
