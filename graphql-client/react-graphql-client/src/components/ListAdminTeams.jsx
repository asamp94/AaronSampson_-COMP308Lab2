import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
      teamName
      status
      teamSlogan
      members {
        id
        userName
        email
        role
      }
    }
  }
`;

const ListAdminTeams = () => {
  const { currentUser, loading: authLoading } = useAuth();

  // Always call hooks (Rules of Hooks)
  const { loading, error, data } = useQuery(GET_TEAMS, {
    skip: !currentUser || currentUser.role !== 'admin',
  });

  // Wait until authentication state is resolved
  if (authLoading) {
    return (
      <div className="text-center mt-3">
        <Spinner animation="border" />
      </div>
    );
  }

  //  UI-level guard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <p className="text-danger text-center mt-3">
        Access denied. Admin privileges required.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-3">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-danger text-center">
        Error: {error.message}
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-3">Teams (Admin)</h2>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Slogan</th>
            <th>Members</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data?.teams?.map((t) => (
            <tr key={t.id}>
              <td>{t.teamName}</td>
              <td>{t.status}</td>
              <td>{t.teamSlogan}</td>
              <td>{t.members?.length}</td>
              <td>
                <Link
                  to={`/admin/teams/${t.id}/members`}
                  className="btn btn-primary btn-sm"
                >
                  Edit Members
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ListAdminTeams;