import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    workspace: { type: String, default: 'Personal' },
    role: { type: String, default: 'Member' },
    theme: { type: String, default: 'light' },
    plan: { type: String, enum: ['solo', 'studio', 'scale'], default: 'studio' },
  },
  { timestamps: true },
)

// Hash a plaintext password before persisting.
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10)
}

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

// Never leak the hash to the client.
userSchema.methods.toSafeJSON = function () {
  const { _id, name, email, workspace, role, theme, plan, createdAt } = this
  return { id: _id, name, email, workspace, role, theme, plan, createdAt }
}

export const User = mongoose.model('User', userSchema)
