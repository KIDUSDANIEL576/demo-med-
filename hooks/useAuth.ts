
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// This is a re-export to simplify imports in other files.
// The actual implementation is in AuthContext.tsx
export { useAuth } from '../contexts/AuthContext';
