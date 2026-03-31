import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Spinner, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Create a new user.
const CREATE_USER = gql`
  mutation CreateUser($userName: String!, $email: String!, $password: String!, $role: String) {
    createUser(userName: $userName, email: $email, password: $password, role: $role) {
      id
      userName
      email
      role
    }
  }
`;

const AddUser = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  // Store form field values.
  const [form, setForm] = useState({
    userName: '',
    email: '',
    password: '',
    role: 'member',
  });

  // Show a short success message after submit.
  const [successMessage, setSuccessMessage] = useState('');

  const [createUser, { loading, error }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      setForm({ userName: '', email: '', password: '', role: 'member' });
      setSuccessMessage('User created successfully.');
      setTimeout(() => navigate('/admin/teams'), 800);
    },
    onError: (err) => console.error('User creation error:', err.message),
  });

  // Update the matching form field.
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Send the form data to GraphQL.
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createUser({ variables: form });
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
    <div>
      <h2>Create User (Admin)</h2>

      {successMessage && (
        <Alert variant="success" className="mt-3">
          {successMessage}
        </Alert>
      )}

      {loading && (
        <Spinner animation="border" role="status" className="mt-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}

      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3">
          <Form.Label>User Name</Form.Label>
          <Form.Control
            type="text"
            name="userName"
            placeholder="Enter user name"
            value={form.userName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select name="role" value={form.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Create User'}
        </Button>

        {error && (
          <p className="text-danger mt-3">
            Error: Unable to create user
          </p>
        )}
      </Form>
    </div>
  );
};

export default AddUser;