const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String,required: true  },
  lastName: { type: String, required: true  },
  contactNumber:{type:String,required: true },
  usertype: { type: String, default: 'admin' }, // Default usertype as 'admin'
  image_Url:{type:String,default:''},
  college:{type:String,required:true},
  year_lvl:{type:String,required:true}
});

module.exports = mongoose.model('User', userSchema);