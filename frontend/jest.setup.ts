import '@testing-library/jest-dom';

jest.mock('framer-motion', () => ({
  motion: {
    button: 'button',
  },
}));
