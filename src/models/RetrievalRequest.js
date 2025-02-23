const mongoose = require('mongoose');

const RetrievalRequestSchema = new mongoose.Schema({


  claimer_name:String,//user based ;automatic
  claimer_college:String,//user based ;automatic
  claimer_lvl:String,//user based ;automatic
  contactNumber: String,// user based;automatic
  date_complained:String, // user based;automatic
  time_complained:String, // user based;automatic
  item_name: String,
  description: String,
  general_location:String,
  specific_location:String,
  date_Lost:String,
  time_Lost:String, 
  owner_image:String,
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Store the userId
 status:String,
});

const RetrievalRequest = mongoose.model('RetrievalRequest', RetrievalRequestSchema);
module.exports = RetrievalRequest;
