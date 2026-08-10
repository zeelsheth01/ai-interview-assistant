
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-900 pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-white mb-4 block">
              Chiku AI
            </Link>
            <p className="text-gray-400 text-sm">
              Your AI-powered interview assistant for better career outcomes.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</Link></li>
              <li><Link to="/compare" className="text-gray-400 hover:text-white transition-colors text-sm">Compare Tools</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/refunds" className="text-gray-400 hover:text-white transition-colors text-sm">Refunds & Cancellation</Link></li>
              <li><Link to="/delivery" className="text-gray-400 hover:text-white transition-colors text-sm">Delivery Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support & Social</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Instagram</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Synikaa. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Chiku AI™ is a trademark of Synikaa.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
