import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState, Project } from './types';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import ChatPage from './components/ChatPage';
import ProjectsPage from './components/ProjectsPage';
import ConfigPage from './components/ConfigPage';
import HiringWizard from './components/HiringWizard';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import ChatbotWidget from './components/ChatbotWidget';

const PROTECTED_VIEWS: ViewState[] = ['dashboard', 'proyectos', 'mensajes', 'perfil', 'configuracion', 'contratacion'];
const AUTH_VIEWS: ViewState[] = ['login', 'register', 'forgot-password'];

export default function App() {
  const { user, loading } = useAuth();
  const [currentView, setView] = useState<ViewState>('landing');
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // Bounce signed-out users away from protected screens, and signed-in users away from
  // login/register/forgot-password. Runs after every render, so it always sees the
  // freshly-updated `user` from AuthContext instead of a stale closure.
  useEffect(() => {
    if (loading) return;
    if (!user && PROTECTED_VIEWS.includes(currentView)) {
      setView('login');
    }
    if (user && AUTH_VIEWS.includes(currentView)) {
      setView('dashboard');
    }
  }, [loading, user, currentView]);

  // Handles landing back in the app after being redirected out to Stripe (Connect
  // onboarding or Checkout). Confirms the payment synchronously, then routes the user
  // somewhere useful and strips the query string.
  useEffect(() => {
    if (loading || !user) return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const projectId = params.get('project');
    const stripeReturn = params.get('stripe_return');
    const stripeRefresh = params.get('stripe_refresh');

    if (!paymentStatus && !stripeReturn && !stripeRefresh) return;

    (async () => {
      if (paymentStatus === 'success' && projectId) {
        try {
          const res = await fetch(`/api/payments/projects/${projectId}/confirm`, { method: 'POST', credentials: 'include' });
          const data = await res.json();
          setPaymentNotice(res.ok ? 'Depósito en garantía confirmado.' : (data.error || 'No se pudo confirmar el pago.'));
        } catch {
          setPaymentNotice('No se pudo confirmar el pago.');
        }
        setView('dashboard');
      } else if (paymentStatus === 'cancelled') {
        setPaymentNotice('El depósito en garantía fue cancelado.');
        setView('dashboard');
      } else if (stripeReturn) {
        setPaymentNotice('Cuenta de Stripe actualizada.');
        setView('perfil');
      } else if (stripeRefresh) {
        setView('perfil');
      }
      window.history.replaceState({}, '', window.location.pathname);
    })();
  }, [loading, user]);

  const handleOpenNewProject = () => {
    setView('contratacion');
  };

  const handleContractCreated = (_newProject: Project) => {
    setView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center">
        <p className="text-xs uppercase tracking-widest font-bold text-editorial-muted">Cargando NYLA...</p>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <>
        <LoginPage setView={setView} />
        <ChatbotWidget />
      </>
    );
  }
  if (currentView === 'register') {
    return (
      <>
        <RegisterPage setView={setView} />
        <ChatbotWidget />
      </>
    );
  }
  if (currentView === 'forgot-password') {
    return <ForgotPasswordPage setView={setView} />;
  }
  if (currentView === 'reset-password') {
    return <ResetPasswordPage setView={setView} />;
  }

  if (currentView === 'landing' || !user) {
    return (
      <>
        <LandingPage setView={setView} />
        <ChatbotWidget />
      </>
    );
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'proyectos':
        return <ProjectsPage setView={setView} />;
      case 'mensajes':
        return <ChatPage setView={setView} />;
      case 'perfil':
        return <ProfilePage setView={setView} />;
      case 'contratacion':
        return (
          <HiringWizard
            setView={setView}
            onContractCreated={handleContractCreated}
          />
        );
      case 'configuracion':
        return <ConfigPage setView={setView} />;
      case 'dashboard':
      default:
        return <Dashboard setView={setView} onOpenNewProject={handleOpenNewProject} />;
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex text-editorial-text font-sans">
      {/* Sidebar for authenticated routes */}
      <Sidebar
        currentView={currentView}
        setView={setView}
        onOpenNewProject={handleOpenNewProject}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:pl-72 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {paymentNotice && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-editorial-text text-editorial-bg px-5 py-3 rounded-2xl text-xs font-bold">
            <span>{paymentNotice}</span>
            <button
              onClick={() => setPaymentNotice(null)}
              className="text-editorial-bg/70 hover:text-editorial-bg bg-transparent border-none cursor-pointer text-xs uppercase tracking-wider"
            >
              Cerrar
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>
      <ChatbotWidget />
    </div>
  );
}
