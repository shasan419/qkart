const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const bcrypt = require("bcryptjs");
const config = require("../config/config");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value) || !validator.isLowercase(value)) {
          throw new Error(
            "Email must be lowerCase and Valid"
          );
          }
      },
    },
    password: {
      type: String,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type: Number,
      required:true,
      default: config.default_wallet_money,
    },
    address: {
      type: String,
      required:true,
      trim:false,
      default: config.default_address,
    },
  },
  // Create createdAt and updatedAt fields automatically
  {
    timestamps: true,
  }
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  const data = await this.findOne({email:email});
  // console.log(data);
  return data? true:false;

};


userSchema.pre("save", function(next) {
  var user = this;

// only hash the password if it has been modified (or is new)
if (!user.isModified('password')) return next();

// generate a salt
bcrypt.genSalt(10, function(err, salt) {
  if (err) return next(err);

  // hash the password using our new salt
  bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
  });
});
});
/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function(pass){
  return bcrypt.compare(pass,this.password)
};

/**
 * Check if user have set an address other than the default address
 * - should return true if user has set an address other than default address
 * - should return false if user's address is the default address
 *
 * @returns {Promise<boolean>}
 */
userSchema.methods.hasSetNonDefaultAddress = async function () {
  const user = this;
   if(user.address === config.default_address){
     return false
   }else{
     return true
   }
};

/* 
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const { User } = require("<user.model file path>");

 // TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create a Mongoose model out of userSchema and export the model as "User"
/**
 * @typedef User
 */
const User = mongoose.model("User", userSchema);
module.exports = {
  User,
};
