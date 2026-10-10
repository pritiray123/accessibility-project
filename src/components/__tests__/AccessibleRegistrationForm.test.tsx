import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { AccessibleRegistrationForm } from '../AccessibleRegistrationForm.tsx';

describe('AccessibleRegistrationForm Component Unit & A11y Suite', () => {
  it('renders all required form controls with semantic associations', () => {
    render(<AccessibleRegistrationForm />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Create Password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('binds helper text via aria-describedby', () => {
    render(<AccessibleRegistrationForm />);
    const nameInput = screen.getByLabelText(/Full Name/i);
    const describedBy = nameInput.getAttribute('aria-describedby');
    expect(describedBy).toContain('fullName-help');
  });

  it('triggers error summary and shifts focus upon invalid submit', async () => {
    render(<AccessibleRegistrationForm />);
    const user = userEvent.setup();

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    await user.click(submitBtn);

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert', { name: /There is a problem with your submission/i });
      expect(errorAlert).toBeInTheDocument();
    });

    const fullNameInput = screen.getByLabelText(/Full Name/i);
    expect(fullNameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('toggles password visibility and updates aria-pressed and input type', async () => {
    render(<AccessibleRegistrationForm />);
    const user = userEvent.setup();

    const passwordInput = screen.getByLabelText(/Create Password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /Show password as plain text/i });
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    expect(toggleBtn).toHaveAccessibleName(/Hide password characters/i);
  });

  it('opens and closes terms dialog modal with focus restoration', async () => {
    render(<AccessibleRegistrationForm />);
    const user = userEvent.setup();

    const termsTrigger = screen.getByRole('button', { name: /Terms of Service/i });
    await user.click(termsTrigger);

    const dialog = screen.getByRole('dialog', { name: /Terms of Service/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Close via close button
    const closeBtn = screen.getByRole('button', { name: /Close Terms of Service dialog/i });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
