import ProjectModel from '../models/project.server.model.js';
import TeamModel from '../models/team.server.model.js';

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
// Team member or admin check (project equivalent of isOwnerOrAdmin)
// Allow access to team members and admins.
const isTeamMemberOrAdmin = (team, user) => {
  if (
    !team.members.some((m) => m.toString() === user.id) &&
    user.role !== 'admin'
  ) {
    throw new Error('Unauthorized');
  }
};

export const projectResolvers = {
  Query: {
    // Get all projects for admins.
    projects: async (_, __, { user }) => {
      requireAdmin(user);
      return ProjectModel.find().sort({ createdAt: -1 });
    },

    // Get one project by id.
    project: async (_, { id }, { user }) => {
      requireAuth(user);

      const project = await ProjectModel.findById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      const team = await TeamModel.findById(project.team);
      if (!team) {
        throw new Error('Team not found');
      }

      isTeamMemberOrAdmin(team, user);
      return project;
    },

    // Get projects for the logged-in user.
    myProjects: async (_, __, { user }) => {
      requireAuth(user);

      if (user.role === 'admin') {
        return ProjectModel.find().sort({ createdAt: -1 });
      }

      const teams = await TeamModel.find({ members: user.id }).select('_id');
      const teamIds = teams.map((t) => t._id);

      return ProjectModel.find({ team: { $in: teamIds } }).sort({
        createdAt: -1,
      });
    },
  },

  Mutation: {
    // Create a new project.
    createProject: async (
      _,
      { projectName, description, teamId, startDate, endDate, status },
      { user }
    ) => {
      requireAdmin(user);

      const team = await TeamModel.findById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      const project = new ProjectModel({
        projectName,
        description,
        team: teamId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status ?? 'pending',
      });

      return project.save();
    },

    // Update project details.
    updateProject: async (
      _,
      { id, projectName, description, teamId, startDate, endDate, status },
      { user }
    ) => {
      requireAdmin(user);

      const project = await ProjectModel.findById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      if (projectName !== undefined) project.projectName = projectName;
      if (description !== undefined) project.description = description;

      if (teamId !== undefined) {
        const team = await TeamModel.findById(teamId);
        if (!team) {
          throw new Error('Team not found');
        }
        project.team = teamId;
      }

      if (startDate !== undefined) project.startDate = new Date(startDate);
      if (endDate !== undefined) project.endDate = new Date(endDate);
      if (status !== undefined) project.status = status;

      return project.save();
    },

    // Let a team member or admin change project status.
    updateProjectStatus: async (_, { id, status }, { user }) => {
      requireAuth(user);

      const project = await ProjectModel.findById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      const team = await TeamModel.findById(project.team);
      if (!team) {
        throw new Error('Team not found');
      }

      isTeamMemberOrAdmin(team, user);

      project.status = status;
      return project.save();
    },

    // Delete a project.
    deleteProject: async (_, { id }, { user }) => {
      requireAdmin(user);

      const project = await ProjectModel.findById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      await project.deleteOne();
      return true;
    },
  },

  Project: {
    // Load the related team for each project.
    team: async (project) => TeamModel.findById(project.team),
  },
};