import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAuth } from '../context/AuthContext';

// Load the logged-in user's projects.
const GET_PROJECT = gql`
  query GetProjects {
    myProjects {
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

// Update the status of one project.
const UPDATE_STATUS = gql`
  mutation UpdateProjectStatus($id: ID!, $status: String!) {
    updateProjectStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

const ListProjects = () => {
  const { currentUser } = useAuth();

  // Store the selected status before saving.
  const [statusDraft, setStatusDraft] = useState({});

  const { loading, error, data, refetch } = useQuery(GET_PROJECT);

  const [updateProjectStatus, { loading: saving }] = useMutation(UPDATE_STATUS, {
    onCompleted: () => refetch(),
  });

  // Refresh the project list when the page opens.
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Show loading and error states.
  if (loading) return <p>Loading Projects</p>;
  if (error) return <p className="text-danger">Error loading projects</p>;

  return (
    <div>
      <h2>My Projects</h2>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Team</th>
            <th>Status</th>
            <th>Dates</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.myProjects?.map((p) => {
            const draft = statusDraft[p.id] ?? p.status;

            return (
              <tr key={p.id}>
                <td>{p.projectName}</td>
                <td>{p.team?.teamName ?? '—'}</td>
                <td>{p.status}</td>
                <td>
                  {new Date(p.startDate).toLocaleDateString()} →{' '}
                  {new Date(p.endDate).toLocaleDateString()}
                </td>
                <td>
                  <div className="d-flex gap-2 justify-content-center">
                    <Form.Select
                      size="sm"
                      value={draft}
                      onChange={(e) =>
                        setStatusDraft((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      style={{ maxWidth: 180 }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Form.Select>

                    <Button
                      size="sm"
                      variant="outline-primary"
                      disabled={saving || draft === p.status}
                      onClick={() =>
                        updateProjectStatus({ variables: { id: p.id, status: draft } })
                      }
                    >
                      Save
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default ListProjects;