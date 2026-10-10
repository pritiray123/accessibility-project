import React, { useState } from 'react';
import { AccessibleRegistrationForm } from './components/AccessibleRegistrationForm.tsx';
import { AuditDashboard } from './components/AuditDashboard.tsx';
import './styles/accessibility.css';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'form' | 'audit'>('form');

  return (
    <>
      {/* Skip to Main Content Link (WCAG 2.4.1 Bypass Blocks) */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Global Site Header */}
      <header className="site-header" role="banner">
        <div className="site-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                GOV/ENTERPRISE PORTAL
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                WCAG 2.2 Level AA Certified Architecture
              </span>
            </div>
            <span className="brand-badge" aria-label="Conformance level: WCAG 2.2 Level AA">
              WCAG 2.2 AA
            </span>
          </div>

          <nav aria-label="Primary Navigation">
            <ul className="nav-tabs">
              <li>
                <button
                  type="button"
                  className="nav-tab-button"
                  aria-current={currentView === 'form' ? 'page' : undefined}
                  onClick={() => setCurrentView('form')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm2 1v8h8V4H4zm2 2h4v1H6V6zm0 2h4v1H6V8zm0 2h2v1H6v-1z"/>
                  </svg>
                  Registration Portal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="nav-tab-button"
                  aria-current={currentView === 'audit' ? 'page' : undefined}
                  onClick={() => setCurrentView('audit')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.707 6.707-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414L7 8.586l3.293-3.293a1 1 0 0 1 1.414 1.414z"/>
                  </svg>
                  Audit Dashboard (/audit)
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main View Display */}
      {currentView === 'form' ? <AccessibleRegistrationForm /> : <AuditDashboard />}

      {/* Accessible Site Footer */}
      <footer
        role="contentinfo"
        style={{
          borderTop: '1px solid var(--color-border-card)',
          backgroundColor: 'var(--color-surface-bg)',
          marginTop: '48px',
          padding: '24px 0',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <div className="site-header-inner" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <p>
            © {new Date().getFullYear()} Enterprise Systems Group. Built to strict WCAG 2.2 AA & Section 508 accessibility guidelines.
          </p>
          <p>
            Need accessibility accommodations or encountering an assistive barrier? Contact{' '}
            <a href="mailto:accessibility@enterprise.internal" style={{ color: 'var(--color-interactive-primary)' }}>
              accessibility@enterprise.internal
            </a>.
          </p>
        </div>
      </footer>
    </>
  );
};
