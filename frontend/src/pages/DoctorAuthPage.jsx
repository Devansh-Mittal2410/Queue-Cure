import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Stethoscope, UserPlus } from 'lucide-react';
import { authRequest, saveDoctorSession } from '../utils/auth';

const DoctorAuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: 'General Consultation',
  });

  const isSignup = mode === 'signup';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authRequest(isSignup ? '/api/auth/signup' : '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      saveDoctorSession(data);
      navigate('/doctor-analytics');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50 px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 md:grid-cols-[1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            Doctor workspace for cleaner queues and sharper analytics.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Sign in to view only your assigned patients, call your next token, and keep your analytics separated by doctor.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-2xl backdrop-blur"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                {isSignup ? 'Create doctor account' : 'Doctor login'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isSignup ? 'Register a doctor profile.' : 'Continue to your dashboard.'}
              </p>
            </div>
            {isSignup ? <UserPlus className="h-6 w-6 text-orange-500" /> : <LogIn className="h-6 w-6 text-teal-600" />}
          </div>

          <div className="space-y-4">
            {isSignup && (
              <>
                <input
                  type="text"
                  required
                  placeholder="Doctor name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
                <input
                  type="text"
                  placeholder="Specialty"
                  value={formData.specialty}
                  onChange={(event) => setFormData({ ...formData, specialty: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </>
            )}
            <input
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white shadow-lg disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? 'login' : 'signup');
              setError('');
            }}
            className="mt-4 w-full rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700"
          >
            {isSignup ? 'Already have an account? Login' : 'New doctor? Create account'}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default DoctorAuthPage;
