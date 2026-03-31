import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Log in the user.
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      user {
        id
        userName
        email
        role
      }
    }
  }
`;

const LoginUser = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  // Store form field values.
  const [form, setForm] = useState({ email: '', password: '' });

  const [loginUser, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      setCurrentUser(data.loginUser.user);
      navigate('/home');
    },
  });

  // Update the matching form field.
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Send the login request.
  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginUser({ variables: form });
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h2>Login</h2>

      {error && (
        <Alert variant="danger" className="mt-3">
          {error.message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="mt-3">
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

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Logging in…
            </>
          ) : (
            'Login'
          )}
        </Button>
      </Form>
    </div>
  );
};

export default LoginUser;