const mongoose = require('mongoose');

const foundationSchema = new mongoose.Schema({
  
  foundation_name:String,
  foundation_type:String,
  foundation_description :String,
  foundation_link:String,
   
  foundation_contact:String,

  foundation_image:String,
  foundation_start_date:String,
  foundation_end_date:String,
  

});

const Foundation = mongoose.model('Foundation', foundationSchema);


module.exports = Foundation;
