import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './components/Home';
import LoginUser from './components/LoginUser';
import AddUser from './components/AddUser';

// Admin
import AddTeam from './components/AddTeam';
import AdminTeams from './components/ListAdminTeams';
import AddProject from './components/AddProject';
import AdminProjects from './components/ListAdminProject';

// Member
import MyTeams from './components/ListTeams';
import MyProjects from './components/ListProjects';
import EditTeamMembers from './components/EditTeamMembers';

const LOG_OUT = gql`
  mutation LogOut {
    logOut
  }
`;

function AppLayout() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [logOut] = useMutation(LOG_OUT, {
    onCompleted: () => {
      setCurrentUser(null);
      navigate('/login');
    },
  });

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/home">
            Team & Project Manager (GraphQL)
          </Navbar.Brand>

          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home">Home</Nav.Link>

            {!currentUser && (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
              </>
            )}

            {currentUser && (
              <>
                <Nav.Link as={Link} to="/my/teams">My Teams</Nav.Link>
                <Nav.Link as={Link} to="/my/projects">My Projects</Nav.Link>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin/users/new">Create User</Nav.Link>
                <Nav.Link as={Link} to="/admin/teams/new">Create Team</Nav.Link>
                <Nav.Link as={Link} to="/admin/teams">List Teams</Nav.Link>
                <Nav.Link as={Link} to="/admin/projects/new">Create Project</Nav.Link>
                <Nav.Link as={Link} to="/admin/projects">List Projects</Nav.Link>
              </>
            )}
          </Nav>

          {currentUser && (
            <Button variant="outline-light" size="sm" onClick={logOut}>
              Log out
            </Button>
          )}
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginUser />} />

        {/* Member */}
        <Route path="/my/teams" element={<MyTeams />} />
        <Route path="/my/projects" element={<MyProjects />} />
        

        {/* Admin */}
        <Route path="/admin/users/new" element={<AddUser />} />
        <Route path="/admin/teams/new" element={<AddTeam />} />
        <Route path="/admin/teams" element={<AdminTeams />} />
        <Route path="/admin/projects/new" element={<AddProject />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/teams/:id/members" element={<EditTeamMembers />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}