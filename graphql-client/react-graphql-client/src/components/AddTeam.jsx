import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Create a new team.
const CREATE_TEAM = gql`
  mutation CreateTeam($teamName: String!, $description: String!, $status: String, $teamSlogan: String) {
    createTeam(teamName: $teamName, description: $description, status: $status, teamSlogan: $teamSlogan) {
      id
    }
  }
`;

const AddTeam = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  // Store form field values.
  const [form, setForm] = useState({
    teamName: '',
    description: '',
    status: 'active',
    teamSlogan: '',
  });

  const [createTeam] = useMutation(CREATE_TEAM, {
    onCompleted: () => navigate('/admin/teams'),
  });

  // Send the form data to GraphQL.
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTeam({ variables: form });
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

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Create Team (Admin)</h2>

      <Form.Control
        className="mb-2"
        placeholder="Team Name"
        required
        onChange={(e) => setForm({ ...form, teamName: e.target.value })}
      />

      <Form.Control
        className="mb-2"
        placeholder="Team Slogan (custom field)"
        value={form.teamSlogan}
        onChange={(e) => setForm({ ...form, teamSlogan: e.target.value })}
      />

      <Form.Control
        className="mb-2"
        placeholder="Description"
        as="textarea"
        required
        rows={4}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Form.Select
        className="mb-2"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Form.Select>

      <Button type="submit" className="mt-2">Create</Button>
    </Form>
  );
};

export default AddTeam;