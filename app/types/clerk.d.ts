
declare global {
  interface CustomJwtSessionClaims {
    publicMetadata: {
      role?: 'admin' | 'alumni';
    };
  }
}

// You need this empty export statement for the file to be 
// treated as a module and for the declaration to be applied globally.
export {};