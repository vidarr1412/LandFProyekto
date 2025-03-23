const mongoose = require("mongoose");
const { MdDescription } = require("react-icons/md");

const complaintSchema = new mongoose.Schema({
  complainer: { type: String, required: true },
  college: { type: String, required: true },
  year_lvl:{ type: String, required: true },
 itemname: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  contact: { type: String, required: true },
  general_location: { type: String, required: true },
  location: { type: String, required: true },//specific location
  date: { type: String, required: true },//date lost
  time: { type: String, required: true },//time lost
  date_complained:{ type: String, required: true }, 
  time_complained:{ type: String, required: true }, 
  status: { type: String },
  finder: { type: String, default: "N/A" },
 userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Store the userId
 duration: Number, 
 item_image: { type: String },
});

module.exports = mongoose.model("Complaint", complaintSchema);
