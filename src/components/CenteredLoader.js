import React from 'react';

const loaderStyles = {
  container: {
    width: '100%',
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#0a66ff',
    fontWeight: 500,
    fontSize: '14px',
  },
};

const CenteredLoader = ({ text = 'Loading...' }) => {
  return (
    <div style={loaderStyles.container}>
      <span style={loaderStyles.text}>{text}</span>
    </div>
  );
};

export default CenteredLoader;

