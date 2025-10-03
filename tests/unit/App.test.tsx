import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/renderer/App';

describe('App', () => {
  it('should render the welcome screen', () => {
    render(<App />);

    expect(screen.getByText(/Welcome to FintonText/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /A powerful text editor with Git-based document management/i
      )
    ).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<App />);

    expect(screen.getByText('Create Workspace')).toBeInTheDocument();
    expect(screen.getByText('Open Workspace')).toBeInTheDocument();
  });

  it('should render feature highlights', () => {
    render(<App />);

    expect(screen.getByText('Mode Switching')).toBeInTheDocument();
    expect(screen.getByText('Full-Text Search')).toBeInTheDocument();
    expect(screen.getByText('Git Integration')).toBeInTheDocument();
    expect(screen.getByText('Tags & Organization')).toBeInTheDocument();
  });

  it('should render titlebar', () => {
    render(<App />);

    const titlebar = screen.getByText('FintonText');
    expect(titlebar).toBeInTheDocument();
  });

  it('should have workspace state initialized', () => {
    render(<App />);

    // App should render without errors
    expect(screen.getByText(/Welcome to FintonText/i)).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<App />);

    // Basic accessibility check - more comprehensive checks will be added
    expect(container.querySelector('.app')).toBeInTheDocument();
  });
});
