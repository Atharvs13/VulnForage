// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { App } from './App';

describe('routing', () => {
  it('renders the public landing page', () => {
    render(<MemoryRouter initialEntries={['/']}><AuthProvider><App/></AuthProvider></MemoryRouter>);
    expect(screen.getByText('Break the application.')).toBeInTheDocument();
  });
});
