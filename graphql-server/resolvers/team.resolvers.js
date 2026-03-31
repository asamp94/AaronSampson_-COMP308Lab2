import TeamModel from '../models/team.server.model.js';
import UserModel from '../models/user.server.model.js';

// Auth helpers
// Make sure a user is logged in.
const requireAuth = (user) => {
  if (!user) throw new Error('Not authenticated');
};
// Admin check
// Make sure the user is an admin.
const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
};
// Member or admin check (team equivalent of isOwnerOrAdmin)
// Allow access to team members and admins.
const isMemberOrAdmin = (team, user) => {
  if (
    !team.members.some((m) => m.toString() === user.id) &&
    user.role !== 'admin'
  ) {
    throw new Error('Unauthorized');
  }
};

export const teamResolvers = {
  Query: {
    // Get all teams for admins.
    teams: async (_, __, { user }) => {
      requireAdmin(user);
      return TeamModel.find().sort({ createdAt: -1 });
    },

    // Get one team by id.
    team: async (_, { id }, { user }) => {
      requireAuth(user);

      const team = await TeamModel.findById(id);
      if (!team) {
        throw new Error('Team not found');
      }

      isMemberOrAdmin(team, user);

      return team;
    },

    // Get teams for the logged-in user.
    myTeams: async (_, __, { user }) => {
      requireAuth(user);

      if (user.role === 'admin') {
        return TeamModel.find().sort({ createdAt: -1 });
      }

      return TeamModel.find({ members: user.id }).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    // Create a new team.
    createTeam: async (
      _,
      { teamName, description, status, teamSlogan, memberIds },
      { user }
    ) => {
      requireAdmin(user);

      const team = new TeamModel({
        teamName,
        description,
        status: status ?? 'active',
        teamSlogan: teamSlogan ?? '',
        members: memberIds ?? [],
      });

      return team.save();
    },

    // Update team details.
    updateTeam: async (
      _,
      { id, teamName, description, status, teamSlogan, memberIds },
      { user }
    ) => {
      requireAdmin(user);

      const team = await TeamModel.findById(id);
      if (!team) {
        throw new Error('Team not found');
      }

      if (teamName !== undefined) team.teamName = teamName;
      if (description !== undefined) team.description = description;
      if (status !== undefined) team.status = status;
      if (teamSlogan !== undefined) team.teamSlogan = teamSlogan;
      if (memberIds !== undefined) team.members = memberIds;

      return team.save();
    },

    // Delete a team.
    deleteTeam: async (_, { id }, { user }) => {
      requireAdmin(user);

      const team = await TeamModel.findById(id);
      if (!team) {
        throw new Error('Team not found');
      }

      await team.deleteOne();
      return true;
    },
  },

  Team: {
    // Load the related users for each team.
    members: async (team) =>
      UserModel.find({ _id: { $in: team.members } }),
  },
};