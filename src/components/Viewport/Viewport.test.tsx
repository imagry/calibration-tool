// src/components/Viewport/Viewport.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Viewport from './Viewport';

describe('Viewport', () => {
  const src = 'test-image.jpg';

  it('renders without crashing', () => {
    const { getByRole } = render(<Viewport src={src} />);
    const canvas = getByRole('img');
    expect(canvas).toBeInTheDocument();
  });

  it('handles wheel event', () => {
    const { getByRole } = render(<Viewport src={src} />);
    const canvas = getByRole('img');
    fireEvent.mouseEnter(canvas);
    fireEvent.wheel(canvas, { deltaY: -100 });
    // Add assertions to verify the effect of the wheel event
  });

  it('handles mouse down and mouse move events', () => {
    const { getByRole } = render(<Viewport src={src} />);
    const canvas = getByRole('img');
    fireEvent.mouseEnter(canvas);
    fireEvent.mouseDown(canvas, { button: 1, pageX: 100, pageY: 100 });
    fireEvent.mouseMove(canvas, { pageX: 150, pageY: 150 });
    // Add assertions to verify the effect of the mouse move event
  });

  it('handles mouse up event', () => {
    const { getByRole } = render(<Viewport src={src} />);
    const canvas = getByRole('img');
    fireEvent.mouseEnter(canvas);
    fireEvent.mouseDown(canvas, { button: 1, pageX: 100, pageY: 100 });
    fireEvent.mouseUp(canvas, { button: 1 });
    // Add assertions to verify the effect of the mouse up event
  });

  it('adds and removes event listeners on hover', () => {
    const { getByRole } = render(<Viewport src={src} />);
    const canvas = getByRole('img');
    fireEvent.mouseEnter(canvas);
    // Add assertions to verify event listeners are added
    fireEvent.mouseLeave(canvas);
    // Add assertions to verify event listeners are removed
  });
});
