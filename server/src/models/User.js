import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { isAdminUser } from '../config/env.js'
import { ACCOUNT_STATUSES, ACCOUNT_TYPES } from '../constants.js'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    workspace: { type: String, default: 'Personal' },
    role: { type: String, default: 'Member' },
    theme: { type: String, default: 'light' },
    plan: { type: String, enum: ['solo', 'studio', 'scale'], default: 'studio' },
    // Guest vs Company registration. A function default (not a static one) so
    // pre-existing accounts infer correctly from data they already have —
    // one who already filled in a company name reads as 'company', a blank
    // legacy account reads as 'guest' — with zero migration either way.
    accountType: {
      type: String,
      enum: ACCOUNT_TYPES,
      default: function () { return this.companyName ? 'company' : 'guest' },
    },
    // Customer Management — business profile. All optional/additive so every
    // pre-existing account keeps working with these simply blank.
    companyName: { type: String, trim: true },
    vatNumber: { type: String, trim: true },
    country: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    // Defaults to true so every existing document (which has no value stored
    // for this path) hydrates as verified with zero migration — only new
    // signups explicitly set this false until they click the email link.
    emailVerified: { type: Boolean, default: true },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    status: { type: String, enum: ACCOUNT_STATUSES, default: 'active' },
    lastLoginAt: Date,
    invitedByAdmin: { type: Boolean, default: false },
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

// Never leak the hash or verification token to the client.
userSchema.methods.toSafeJSON = function () {
  const {
    _id, name, email, workspace, role, theme, plan, createdAt,
    accountType, companyName, vatNumber, country, firstName, lastName, phone, linkedinUrl,
    emailVerified, status, lastLoginAt, invitedByAdmin,
  } = this
  return {
    id: _id, name, email, workspace, role, theme, plan, createdAt,
    accountType, companyName, vatNumber, country, firstName, lastName, phone, linkedinUrl,
    emailVerified, status, lastLoginAt, invitedByAdmin,
    isAdmin: isAdminUser(this),
  }
}

export const User = mongoose.model('User', userSchema)
