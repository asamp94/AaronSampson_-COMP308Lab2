import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;
// Define User schema
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never return password by default
    },

    // role-based authorization
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
  },

  {
    timestamps: true,
  }
);

// Hash password ONLY when modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// Instance method for password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;