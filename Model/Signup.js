const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: {
   type:String,
   required:true
  },
  email: 
  { type: String,
    required:true
  },
  phoneNumber: 
  {type:String,
    required:true
  } ,
  password:{
    type: String,
    required:true,
  },
  userRole:String

});

const Sign= mongoose.model('Signin', schema);
module.exports = Sign;
