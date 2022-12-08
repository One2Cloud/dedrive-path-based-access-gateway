import mongoose, { Types, HydratedDocument, Schema, Document } from 'mongoose';
import { IPod } from './pod.model';

export interface IItem extends Document<Types.ObjectId> {
  uid: string;
  pod: Types.ObjectId;
  prefix: string;
  type: string;
  name: string;
  status: string;
  primaryProvider: string;
  providers: string[];
  versionId: number;
  size: number;
  eTag?: string;
  owner: string;
  chunking: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<IItem>({
  uid: { type: String, unique: true },
  pod: { type: mongoose.Schema.Types.ObjectId, ref: 'pod' },
  prefix: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  primaryProvider: { type: String, required: true },
  providers: { type: [String], required: true },
  versionId: { type: Number, required: true, default: 0 },
  size: { type: Number, required: true },
  eTag: { type: String, required: false },
  owner: { type: String },
  chunking: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

const model = mongoose.model<IItem>('item', schema);

export default model;
