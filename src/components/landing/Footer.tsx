
import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary/95 to-primary text-primary-foreground">
      {/* CTA Section */}
      <div className="container py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">
              Unlock professional class AI for your firm
            </h2>
          </div>
          <div className="flex-shrink-0">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 border-2 border-primary/20 hover:border-primary/40">
                Request a Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="border-t border-primary-foreground/20">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {/* Logo */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <BrainCircuit className="h-8 w-8" />
                <span className="font-bold text-xl">ROSS.AI</span>
              </Link>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-semibold mb-4 text-primary-foreground/90">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Assistant</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Vault</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Knowledge</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Workflows</Link></li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="font-semibold mb-4 text-primary-foreground/90">Solutions</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Innovation</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">In-House</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Transactional</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Litigation</Link></li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="font-semibold mb-4 text-primary-foreground/90">About</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Customers</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Security</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Company</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Blog</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Newsroom</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4 text-primary-foreground/90">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Legal</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Press Kit</Link></li>
              </ul>
            </div>

            {/* Follow */}
            <div>
              <h3 className="font-semibold mb-4 text-primary-foreground/90">Follow</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">LinkedIn</Link></li>
                <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Twitter</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-primary-foreground/20">
        <div className="container py-6">
          <div className="text-sm text-primary-foreground/60">
            <p>Copyright © 2025 ROSS.AI Corporation.</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
