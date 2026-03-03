const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'User must have a name'] 
  },
  email: { 
    type: String, 
    required: [true, 'User must have an email'], 
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'This is not a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'User must have a password'], 
    minlength: 8,
    select: false 
  },
  confirmedPassword: { 
    type: String, 
    required: [true, 'Please confirm your password'], 
    select: false,
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  role: { 
    type: String, 
    enum: ['user','admin'], 
    default: 'user' 
  },
  active: {
    default:true,
    select:false,
    type:Boolean
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save",async function(next){
  if(!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password,12)
  this.confirmedPassword= undefined
})

userSchema.pre(/^find/,function(next){
  this.find({active:{$ne:false}})
})
userSchema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000
  return resetToken
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp; 
  }
  return false;
};
const User = mongoose.model('User', userSchema);
module.exports = User;