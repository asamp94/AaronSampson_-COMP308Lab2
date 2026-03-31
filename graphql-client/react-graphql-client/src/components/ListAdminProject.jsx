import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import { useAuth } from '../context/AuthContext';

// Load all projects for the admin list.
const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      projectName
      status
      startDate
      endDate
      team {
        id
        teamName
      }
    }
  }
`;

const ListAdminProjects = () => {
  const { currentUser, loading: authLoading } = useAuth();

  // Only admins should load this data.
  const { loading, error, data } = useQuery(GET_PROJECTS, {
    skip: !currentUser || currentUser.role !== 'admin',
  });

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

  // Show loading and error states.
  if (loading) return <p>Loading projects…</p>;
  if (error) return <p className="text-danger">Error loading projects</p>;

  return (
    <div>
      <h2 className="mb-3">Projects (Admin)</h2>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Team</th>
            <th>Status</th>
            <th>Dates</th>
          </tr>
        </thead>
        <tbody>
          {data?.projects?.map((p) => (
            <tr key={p.id}>
              <td>{p.projectName}</td>
              <td>{p.team?.teamName ?? '—'}</td>
              <td>{p.status}</td>
              <td>
                {new Date(p.startDate).toLocaleDateString()} →{' '}
                {new Date(p.endDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ListAdminProjects;