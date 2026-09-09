import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { PlaceholderScreen } from '../PlaceholderScreen';

describe('PlaceholderScreen', () => {
  it('renders the emoji, title, and body text', async () => {
    await render(<PlaceholderScreen emoji="🏋️" title="Coming soon" body="This screen is under construction." />);

    expect(screen.getByText('🏋️')).toBeTruthy();
    expect(screen.getByText('Coming soon')).toBeTruthy();
    expect(screen.getByText('This screen is under construction.')).toBeTruthy();
  });
});
