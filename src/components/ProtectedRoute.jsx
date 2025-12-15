import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
  const user = savedUser ? JSON.parse(savedUser) : null;

  console.log("🔒 ProtectedRoute check:", {
    hasUser: !!user,
    userRole: user?.role,
    requiredRole
  });

  if (!user) {
    console.log("❌ No user found, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // 💡 FIX: Case-insensitive role comparison
  if (requiredRole) {
    const userRole = user.role?.toUpperCase();
    const required = requiredRole.toUpperCase();

    if (userRole !== required) {
      console.log(`❌ Role mismatch: ${userRole} !== ${required}, redirecting to home`);
      return <Navigate to="/" replace />;
    }
  }

  console.log("✅ Access granted");
  return children;
};

export default ProtectedRoute;