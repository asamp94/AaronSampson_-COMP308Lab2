import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="text-center mt-4">
      <h1>Team &amp; Project Manager</h1>
      <p className="lead mt-3">
        A full-stack MERN application using GraphQL &amp; Apollo Server.
      </p>

      {currentUser ? (
        <p>
          Welcome back, <strong>{currentUser.userName}</strong>! You are logged in
          as <strong>{currentUser.role}</strong>.
        </p>
      ) : (
        <p>Please log in to get started.</p>
      )}
    </div>
  );
};

export default Home;