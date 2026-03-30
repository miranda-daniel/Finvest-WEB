# Claude Code Guidelines — Finvest WEB

## Code Comments

All code comments (inline comments, block comments, JSDoc) must be written in **English**.

## Git

Never commit automatically. Leave all changes in the working area and let the user decide when to commit.

## Code Style

### TypeScript

- Use strict TypeScript - no `any` types
- Prefer interfaces over type aliases for objects

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Props interfaces should be defined above the component

### Async Operations

- Use async/await for all async operations
- Always include try/catch with meaningful error messages

### Error Handling

- Always catch errors and provide user feedback
- Log errors to console for debugging
- Show user-friendly error messages in UI

## File Structure

### Components

- Location: `src/components/`
- One component per file
- Name files same as component (PascalCase)
- Export as named export

### API layer

- Location: `src/api/` — see `src/api/CLAUDE.md` for full conventions

## Patterns

### Data fetching

- Use Apollo hooks (`useQuery`, `useMutation`) — never fetch data in `useEffect`
- Components never import Apollo directly — always go through custom hooks in `src/api/hooks/`

### State Management

- Local state: `useState`
- Global state: Zustand
