import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ១. UserProtectedRoute: អនុញ្ញាតឱ្យទាំង user និង admin ចូលមើលបាន។
 * លក្ខខណ្ឌ៖ គ្រាន់តែមានទិន្នន័យ Login នៅក្នុង localStorage គឺអាចចូលបានហើយ។
 */
export function UserProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    // បើមិនទាន់បាន Login ទេ វានឹងរុញទៅទំព័រ Login វិញ
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * ២. AdminProtectedRoute: អនុញ្ញាតតែ admin តែមួយគត់ដែលស្របតាមលក្ខខណ្ឌ។
 * លក្ខខណ្ឌ៖ ត្រូវតែមានទិន្នន័យ Login ហើយតម្លៃ u.role ត្រូវតែស្មើនឹង 'admin' ផ្ដាច់មុខ។
 */
export function AdminProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    // បើមិនទាន់បាន Login ទេ វានឹងរុញទៅទំព័រ Login វិញ
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    // បើបាន Login ហើយ តែសិទ្ធិមិនមែនជា admin (ជា user ធម្មតា) វានឹងរុញត្រឡប់ទៅ Dashboard វិញ
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}
