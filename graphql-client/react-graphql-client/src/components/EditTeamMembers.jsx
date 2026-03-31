import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const GET_TEAM = gql`
  query GetTeam($id: ID!) {
    team(id: $id) {
      id
      teamName
      members {
        id
        userName
        email
      }
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      userName
      email
      role
    }
  }
`;

const UPDATE_TEAM = gql`
  mutation UpdateTeam($id: ID!, $memberIds: [ID!]) {
    updateTeam(id: $id, memberIds: $memberIds) {
      id
      updatedAt
    }
  }
`;

const EditTeamMembers = () => {
  const { id } = useParams(); // team id
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  // Local state 
  const [memberIds, setMemberIds] = useState([]);

  // Load team
  const { data: teamData, loading: teamLoading, error: teamError } = useQuery(
    GET_TEAM,
    {
      variables: { id },
      skip: !currentUser || currentUser.role !== 'admin',
      fetchPolicy: 'network-only',
    }
  );

  // Load users for selection list
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(GET_USERS, {
    skip: !currentUser || currentUser.role !== 'admin',
    fetchPolicy: 'network-only',
  });

  // sync local state with query result 
  useEffect(() => {
    if (teamData?.team) {
      setMemberIds(teamData.team.members.map((m) => m.id));
    }
  }, [teamData]);

  // Save mutation
  const [updateTeam, { loading: saving, error: saveError }] = useMutation(
    UPDATE_TEAM,
    {
      onCompleted: () => navigate('/admin/teams'),
    }
  );

  const toggleMember = (userId) => {
    setMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateTeam({ variables: { id, memberIds } });
  };

  // --- UI states ---
  if (authLoading) return <p>Loading…</p>;

  // UI-level guard
  if (!currentUser || currentUser.role !== 'admin') {
    return <p className="text-danger">Access denied. Admin privileges required.</p>;
  }

  if (teamLoading || usersLoading) return <p>Loading…</p>;
  if (teamError || usersError) return <p className="text-danger">Error loading data</p>;

  const teamName = teamData?.team?.teamName ?? '';
  const users = usersData?.users ?? [];

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Edit Team Members</h2>
      <p>
        Team: <strong>{teamName}</strong>
      </p>

      <Form.Group className="mb-3">
        <Form.Label>Select Members</Form.Label>

        <div
          className="border rounded p-3"
          style={{ maxHeight: 320, overflowY: 'auto' }}
        >
          {users.map((u) => (
            <Form.Check
              key={u.id}
              type="checkbox"
              label={`${u.userName} (${u.email})`}
              checked={memberIds.includes(u.id)}
              onChange={() => toggleMember(u.id)}
              className="mb-2"
            />
          ))}
        </div>
      </Form.Group>

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>

      <Button
        variant="secondary"
        type="button"
        className="ms-2"
        onClick={() => navigate('/admin/teams')}
      >
        Cancel
      </Button>

      {saveError && (
        <p className="text-danger mt-2">
          Error: Unable to save changes
        </p>
      )}
    </Form>
  );
};

export default EditTeamMembers;