import React from 'react';

const TestSimple = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, React routing is working!</p>
      <button onClick={() => window.location.href = '/dashboard'}>
        Go to Dashboard
      </button>
    </div>
  );
};

export default TestSimple;