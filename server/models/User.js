const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// This is to import the schema from Book.js:
const bookSchema = require('./Book');

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
  // savedBooks becomes an array that adheres to the bookSchema:
    savedBooks: [bookSchema],
  },
  
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// User password:
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// Method to compare and validate password for logging in:
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// To get another field called `bookCount` with the number of saved books:
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

const User = model('User', userSchema);

module.exports = User;
