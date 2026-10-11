
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnnouncementBar = () => {
  return (
    <Link to="/pricing" className="block w-full bg-primary-600 hover:bg-primary-500 text-white py-2 px-4 text-center text-sm font-medium transition-colors">
      <span className="flex items-center justify-center gap-2">
        Interview practice from ₹10/min — buy minutes when you need them <ArrowRight size={16} />
      </span>
    </Link>
  );
};

export default AnnouncementBar;
