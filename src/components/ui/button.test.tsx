import React from 'react';
import { render } from '@/tests/utils';
import { Button } from './button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button');
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    expect(button).toHaveClass('bg-primary');
  });

  it('applies variant styles correctly', () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>);
    const button = getByRole('button');
    
    expect(button).toHaveClass('bg-destructive');
  });

  it('applies size styles correctly', () => {
    const { getByRole } = render(<Button size="lg">Large Button</Button>);
    const button = getByRole('button');
    
    expect(button).toHaveClass('h-11');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const { getByRole, user } = render(
      <Button onClick={handleClick}>Click me</Button>
    );
    
    const button = getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports disabled state', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    const button = getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('renders as child component when asChild is true', () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('bg-primary');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies custom className correctly', () => {
    const { getByRole } = render(
      <Button className="custom-class">Custom Button</Button>
    );
    const button = getByRole('button');
    
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('bg-primary'); // Still has default classes
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('has proper accessibility attributes', () => {
    const { getByRole } = render(
      <Button aria-label="Test button" aria-description="This is a test button">
        Accessible
      </Button>
    );
    const button = getByRole('button');
    
    expect(button).toHaveAttribute('aria-label', 'Test button');
    expect(button).toHaveAttribute('aria-description', 'This is a test button');
  });
});
