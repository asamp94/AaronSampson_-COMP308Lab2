import { useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Table from 'react-bootstrap/Table';

// Load the logged-in user's teams.
const MY_TEAMS = gql`
  query MyTeams {
    myTeams {
      id
      teamName
      status
      teamSlogan
      members {
        id
        userName
        role
      }
    }
  }
`;

const ListTeams = () => {
  const { loading, error, data, refetch } = useQuery(MY_TEAMS);

  // Refresh the team list when the page opens.
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Show loading and error states.
  if (loading) return <p>Loading teams..</p>;
  if (error) return <p className="text-danger">Error loading Teams</p>;

  return (
    <div>
      <h2>My Teams</h2>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Slogan</th>
            <th>Members</th>
          </tr>
        </thead>
        <tbody>
          {data?.myTeams?.map((t) => (
            <tr key={t.id}>
              <td>{t.teamName}</td>
              <td>{t.status}</td>
              <td>{t.teamSlogan || '—'}</td>
              <td>{t.members?.map((member) => member.userName).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ListTeams;