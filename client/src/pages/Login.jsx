import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Welcome back, Club Admin!');
      navigate('/dashboard');
    }, 600);
  };

  const handleDemoLogin = () => {
    toast.success('Signed in as Demo User (Club Admin)');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        {/* Brand Icon & Name */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-xl shadow-brand-600/30 mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
          ClubOps <span className="text-brand-400">AI</span>
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
          AI-powered operations for smarter events.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-200/80">
          <div className="mb-6 text-left">
            <h3 className="text-lg font-bold text-slate-900">Sign in to your account</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enter your credentials or use instant demo access.</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clubops.ai"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); toast.info('Password reset is mocked for this step.'); }} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center"
              >
                Login
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400 uppercase font-semibold">Or Instant Access</span>
            </div>
          </div>

          {/* Demo Login Button */}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleDemoLogin}
            className="w-full justify-center border-brand-200 bg-brand-50/50 hover:bg-brand-50 text-brand-700 font-semibold"
            leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
            rightIcon={<ArrowRight className="w-4 h-4 text-brand-600" />}
          >
            Demo Login (Club Admin)
          </Button>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a club account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Register Club
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
