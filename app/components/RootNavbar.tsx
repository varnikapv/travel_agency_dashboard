import { Link, useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/auth";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";

interface RootNavbarProps {
  userStatus?: string;
}

const RootNavbar = ({ userStatus }: RootNavbarProps = {}) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logoutUser();
      navigate("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Check if user is admin (status === 'admin')
  const isAdmin = userStatus === 'admin';
  console.log("RootNavbar - userStatus:", userStatus, "isAdmin:", isAdmin);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <img src="/assets/icons/logo.svg" alt="Logo" className="size-8" />
        <span className="text-xl font-bold text-dark-100">Tourvisto</span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/" className="text-dark-100 hover:text-primary-100 transition-colors">
          Home
        </Link>
        {isAdmin && (
          <Link to="/dashboard" className="text-dark-100 hover:text-primary-100 transition-colors">
            Dashboard
          </Link>
        )}
        <ButtonComponent
          type="button"
          cssClass="button-class !h-11 !px-6"
          onClick={handleSignOut}
        >
          <span className="p-16-semibold text-white">Sign Out</span>
        </ButtonComponent>
      </div>
    </nav>
  );
};

export default RootNavbar;
