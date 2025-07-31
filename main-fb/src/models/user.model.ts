import mongoose, { Document, Schema, Model } from "mongoose";

export enum Role {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
}

export interface IUser extends Document {
  clerkId: string;      
  email: string;        
  firstName?: string;   
  lastName?: string;    
  username?: string;    
  imageUrl?: string;    
  createdAt: Date;      
  updatedAt: Date;   
  role: Role;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Role,
      default: Role.USER,
    },
    firstName: { type: String, default: "" },
    lastName:  { type: String, default: "" },
    username:  { type: String, default: "" },
    imageUrl:  { type: String, default: "" },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;