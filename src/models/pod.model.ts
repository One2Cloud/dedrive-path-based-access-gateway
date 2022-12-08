import mongoose from 'mongoose';

export interface IPod {
  name: string;
  primaryProvider: string;
  providers: string[];
  publicAccessible: boolean;
  type: string;
  address?: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<IPod>({
  name: { type: String, required: true },
  primaryProvider: { type: String, required: true },
  providers: { type: [String], required: true },
  publicAccessible: { type: Boolean, required: true },
  type: { type: String, required: true },
  address: { type: String, required: false },
  owner: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

const model = mongoose.model<IPod>('pod', schema);

export default model;
