const typeDefs = `#graphql
  type User {
    id: ID!
    userName: String!
    email: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Team {
    id: ID!
    teamName: String!
    description: String!
    members: [User!]!
    status: String!
    teamSlogan: String!
    createdAt: String!
    updatedAt: String!
  }

  type Project {
    id: ID!
    projectName: String!
    description: String!
    team: Team!
    startDate: String!
    endDate: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User

    teams: [Team!]!
    team(id: ID!): Team
    myTeams: [Team!]!

    projects: [Project!]!
    project(id: ID!): Project
    myProjects: [Project!]!

    me: User
    isLoggedIn: Boolean!
  }

  type Mutation {
    createUser(
      userName: String!
      email: String!
      password: String!
      role: String
    ): User!

    updateUser(
      id: ID!
      userName: String!
      email: String!
    ): User!

    deleteUser(id: ID!): Boolean!

    loginUser(
      email: String!
      password: String!
    ): AuthPayload!

    logOut: String!

    createTeam(
      teamName: String!
      description: String!
      status: String
      teamSlogan: String
      memberIds: [ID!]
    ): Team!

    updateTeam(
      id: ID!
      teamName: String
      description: String
      status: String
      teamSlogan: String
      memberIds: [ID!]
    ): Team!

    deleteTeam(id: ID!): Boolean!

    createProject(
      projectName: String!
      description: String!
      teamId: ID!
      startDate: String!
      endDate: String!
      status: String
    ): Project!

    updateProject(
      id: ID!
      projectName: String
      description: String
      teamId: ID
      startDate: String
      endDate: String
      status: String
    ): Project!

    deleteProject(id: ID!): Boolean!

    updateProjectStatus(
      id: ID!
      status: String!
    ): Project!
  }
`;

export default typeDefs;