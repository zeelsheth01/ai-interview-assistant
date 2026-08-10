import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-white/10 glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-white">
              Chiku AI
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="#product" className="text-gray-300 hover:text-white transition-colors text-sm">Product</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm">Pricing</Link>
            <Link to="#compare" className="text-gray-300 hover:text-white transition-colors text-sm">Compare</Link>
            <Link to="#blog" className="text-gray-300 hover:text-white transition-colors text-sm">Blog</Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth/signin" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Sign in</Link>
            <Link to="/auth/signup" className="bg-white text-dark-900 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-semibold transition-all">Try free</Link>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-dark-800 border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Home</Link>
            <Link to="/pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Pricing</Link>
            <Link to="#compare" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Compare</Link>
            <Link to="#blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Blog</Link>
            <div className="pt-4 flex flex-col gap-2 px-3">
              <Link to="/auth/signin" className="w-full text-center border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium">Sign in</Link>
              <Link to="/auth/signup" className="w-full text-center bg-white text-dark-900 px-4 py-2 rounded-lg text-sm font-semibold">Try free</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
