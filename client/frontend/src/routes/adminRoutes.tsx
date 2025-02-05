import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

// Lazy load admin pages
const TimetablePage = lazy(() => import('../pages/admin/TimetablePage'));
const AllocationPage = lazy(() => import('../pages/admin/AllocationPage'));
const DutiesPage = lazy(() => import('../pages/admin/DutiesPage'));
const RemunerationPage = lazy(() => import('../pages/admin/RemunerationPage'));

// Admin routes configuration
export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    children: [
      {
        path: '',
        element: <Navigate to="timetable/Computer Science" replace />
      },
      {
        path: 'timetable/:branch',
        element: <TimetablePage />
      },
      {
        path: 'allocation/:branch',
        element: <AllocationPage />
      },
      {
        path: 'duties/:branch',
        element: <DutiesPage />
      },
      {
        path: 'remuneration/:branch',
        element: <RemunerationPage />
      }
    ]
  }
];