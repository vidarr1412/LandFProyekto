const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  FINDER: String,//based  on their csv
  FINDER_TYPE:String,//for data visualization 
  ITEM: String,//item name ,based on their csv
  ITEM_TYPE:String,//for data visualization
  DESCRIPTION: String,//item description ,base on their csv
  IMAGE_URL:String,//change to item image later
  CONTACT_OF_THE_FINDER: String,//based on their csv
  DATE_FOUND: String,//based on their csv
  GENERAL_LOCATION:String,//for data visualization
  FOUND_LOCATION: String,//based on their csv
  TIME_RETURNED: String,  //time received
  OWNER: String,
  OWNER_COLLEGE: String,
  OWNER_CONTACT:String,
  OWNER_IMAGE: String,
  DATE_CLAIMED: String,
  TIME_CLAIMED:String,
  STATUS: String,
  
  foundation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Foundation',

  }
});

const Item = mongoose.model('Item', itemSchema);


module.exports = Item;
