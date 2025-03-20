
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert Component', () => {
  it('renders alert with default variant', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('bg-background');
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders destructive variant', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-destructive/50');
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Alert className="custom-class">
        <AlertTitle>Test</AlertTitle>
      </Alert>
    );
    
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
});
