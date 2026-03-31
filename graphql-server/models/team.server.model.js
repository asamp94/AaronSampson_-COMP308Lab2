// graphql-server/models/team.server.model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the team data structure.
const teamSchema = new Schema(
  {
    teamName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    teamSlogan: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
// Create the Team model from the schema.
const TeamModel = mongoose.model('Team', teamSchema);

export default TeamModel;