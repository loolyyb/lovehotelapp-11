import { Link } from "react-router-dom";

export const DashboardFooter = () => {
  return (
    <footer className="w-full py-6 px-4 bg-white/80 backdrop-blur-sm border-t mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-6">
          <Link to="/terms" className="hover:text-burgundy transition-colors">
            Conditions générales
          </Link>
          <Link to="/privacy" className="hover:text-burgundy transition-colors">
            Politique de confidentialité
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/support" className="hover:text-burgundy transition-colors">
            Support
          </Link>
          <span>© {new Date().getFullYear()} Love Hotel</span>
        </div>
      </div>
    </footer>
  );
};