import React from 'react';

const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '2rem 1rem', marginTop: '3rem', borderTop: '1px solid #dee2e6', color: '#6c757d' }}>
      <p>© {new Date().getFullYear()} Hotel Explorer Inc. All rights reserved.</p>
    </footer>
  );
};

export default Footer;