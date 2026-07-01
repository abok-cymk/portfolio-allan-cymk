import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';

// Lazy-load HomePage and ProjectPage for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Suspense
        fallback={
          <div
            className="flex items-center justify-center min-h-screen"
            style={{ color: 'var(--color-text)' }}
          >
            Loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/projects/:slug"
            element={
              <ErrorBoundary
                fallback={
                  <main
                    id="main-content"
                    className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center"
                  >
                    <p style={{ color: 'var(--color-text-heading)' }}>
                      Something went wrong loading this project.
                    </p>
                    <a
                      href="#/"
                      style={{ color: 'var(--color-accent)' }}
                      className="underline"
                    >
                      ← Back to home
                    </a>
                  </main>
                }
              >
                <ProjectPage />
              </ErrorBoundary>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  </StrictMode>,
);
