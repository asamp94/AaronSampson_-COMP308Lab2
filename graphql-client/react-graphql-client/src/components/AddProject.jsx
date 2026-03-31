import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Load teams for the team dropdown.
const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
      teamName
    }
  }
`;

// Create a new project.
const CREATE_PROJECT = gql`
  mutation CreateProject(
    $projectName: String!
    $description: String!
    $teamId: ID!
    $startDate: String!
    $endDate: String!
    $status: String
  ) {
    createProject(
      projectName: $projectName
      description: $description
      teamId: $teamId
      startDate: $startDate
      endDate: $endDate
      status: $status
    ) {
      id
    }
  }
`;

const AddProject = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  // Store form field values.
  const [form, setForm] = useState({
    projectName: '',
    description: '',
    teamId: '',
    startDate: '',
    endDate: '',
    status: 'pending',
  });

  // Only admins should load and use team data here.
  const { loading, error, data } = useQuery(GET_TEAMS, {
    skip: !currentUser || currentUser.role !== 'admin',
  });

  const [createProject] = useMutation(CREATE_PROJECT, {
    onCompleted: () => navigate('/admin/projects'),
  });

  // Send the form data to GraphQL.
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProject({ variables: form });
  };

  // Wait until auth state is ready.
  if (authLoading) {
    return (
      <div className="text-center mt-3">
        <Spinner animation="border" />
      </div>
    );
  }

  // Block non-admin users.
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <p className="text-danger text-center mt-3">
        Access denied. Admin privileges required.
      </p>
    );
  }

  if (loading) return <p>Loading teams…</p>;
  if (error) return <p className="text-danger">Error loading teams</p>;

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Create Project (Admin)</h2>

      <Form.Control
        className="mb-2"
        placeholder="Project Name"
        required
        onChange={(e) => setForm({ ...form, projectName: e.target.value })}
      />

      <Form.Control
        as="textarea"
        rows={4}
        className="mb-2"
        placeholder="Description"
        required
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Form.Select
        className="mb-2"
        required
        value={form.teamId}
        onChange={(e) => setForm({ ...form, teamId: e.target.value })}
      >
        <option value="">Select a Team</option>
        {data?.teams?.map((t) => (
          <option key={t.id} value={t.id}>
            {t.teamName}
          </option>
        ))}
      </Form.Select>

      <Form.Control
        className="mb-2"
        type="date"
        required
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
      />

      <Form.Control
        className="mb-2"
        type="date"
        required
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
      />

      <Form.Select
        className="mb-2"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </Form.Select>

      <Button type="submit" className="mt-2">Create</Button>
    </Form>
  );
};

export default AddProject;