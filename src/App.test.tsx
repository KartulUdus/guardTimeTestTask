import React from 'react';
import { render, screen, waitFor, fireEvent, queryByAttribute } from '@testing-library/react';
import App from './App';
import List from './list'


it('renders page without crashing', () => {
  render(<App />);
});

it('renders list without crashing', () => {
  render(<List />);
});

it('should load and display document list', async () => {
  const app = render(<App />)
  const documentButtons = await waitFor(() => screen.getAllByText('validate checksum'))
  expect(documentButtons.length).toEqual(50)
})

q