import { render, screen } from '@testing-library/react';

// These packages are ESM-only, while Create React App's Jest runtime does not
// transform ESM dependencies from node_modules. The markdown rendering itself
// is covered by the production build, so keep this App test focused on session
// restoration with lightweight test doubles.
jest.mock('react-markdown', () => ({ children }) => <div>{children}</div>);
jest.mock('remark-gfm', () => () => {});
jest.mock('remark-math', () => () => {});
jest.mock('rehype-katex', () => () => {});
jest.mock('./components/ui/magicui/typing-animation', () => ({ text }) => <span>{text}</span>);

import App from './App';

test('renders saved sessions with ISO timestamp strings without crashing', () => {
  const now = new Date('2024-01-01T12:30:00Z').toISOString();

  localStorage.setItem(
    'chat_sessions',
    JSON.stringify([
      {
        id: 1,
        title: 'Saved chat',
        messages: [
          {
            id: 10,
            role: 'assistant',
            content: 'Hello from storage',
            timestamp: now,
          },
        ],
      },
    ])
  );

  render(<App />);

  expect(screen.getByText('Saved chat', { exact: true })).toBeInTheDocument();
});
