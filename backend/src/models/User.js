import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullname: {
        type : String ,
        required:true,
    },
    email : {
        type: String,
        required : true,
        unique: true,
    },
    password :{
        type:String,
        required :true,
        minlength:6,
    },
      bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "",
    },
    learningLanguage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,     // idahr id li h kyuki koi bhi friend ab join hoga ya uska pta chlega id se jo db m store h naam se nhi naam kai ho sakte h aur dusri baat yeh objectki id h hum direct ese object ko bhi store nhi kar rahe sirf uski id 
        /// to jo array banega usme no store honge that is id [1,2,3] not the object itself 
        ref: "User",
      },
    ],
  },
  { timestamps: true }
); 


// pre save hook to hash password before saving user
// yeh function tab chalega jab user save hoga d

const User = mongoose.model("User", userSchema);

export default User;  // model must be in upper camel case

