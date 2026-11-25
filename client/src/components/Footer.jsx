import { Link } from 'react-router';
import Icon from './Icon';

// Change this to your real email
const CONTACT_EMAIL = 'support@yourdomainofrentease.com';

export default function Footer() {
  return (
    <footer id="contact" className="mt-16 bg-brand text-white/80 scroll-mt-4">
      <div className="wrap py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-2xl font-semibold text-white">
            <Icon name="home" size={26} className="text-gold" />
            RentEase
          </p>
          <p className="text-sm mt-2">Rent Smart. Live Better.</p>
        </div>

        <div>
          <p className="font-semibold text-white mb-3">Quick Links</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-gold">Home</Link></li>
            <li><Link to="/products" className="hover:text-gold">Products</Link></li>
            <li><Link to="/#about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/account/rentals" className="hover:text-gold">My Rentals</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white mb-3">Contact</p>
          <p className="text-sm">
            Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-gold">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="wrap py-4 text-center text-xs">© {new Date().getFullYear()} RentEase. All rights reserved.</p>
      </div>
    </footer>
  );
}