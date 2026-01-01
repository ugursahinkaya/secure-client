# @ugursahinkaya/secure-auth

Production-grade E2E encrypted authentication and API client for secure communication.

## Architecture

```
src/
├── index.ts                           # Public API exports
├── types.ts                           # TypeScript type definitions
├── secure-client.ts                   # Core HTTP client with E2E encryption
├── use-secure-client.ts              # Composable API for components
├── constants/
│   └── index.ts                      # Application constants
├── utils/
│   ├── errorUtils.ts                 # Error handling utilities
│   └── validationUtils.ts            # Input validation utilities
├── state/
│   └── StateManager.ts               # State management with observer pattern
├── bridge/
│   └── NativeBridgeManager.ts        # Native platform communication
├── events/
│   └── EventDispatcher.ts            # Event dispatching to DOM and native
├── auth/
│   └── AuthManager.ts                # Authentication flow management
└── manager/
    └── SecureClientManager.ts        # Main orchestrator
```

## Features

- ✅ **E2E Encryption**: Secure communication with end-to-end encryption
- ✅ **Native Bridge**: Seamless communication with native platforms (iOS, Android, Flutter, React Native)
- ✅ **State Management**: Reactive state updates with observer pattern
- ✅ **Type-Safe**: Full TypeScript support with comprehensive type definitions
- ✅ **Modular Architecture**: Clean separation of concerns
- ✅ **Production Ready**: Error handling, logging, and validation
- ✅ **Framework Agnostic**: Works with any JavaScript framework

## Usage

### Basic Usage

```typescript
import { useSecureClient } from '@ugursahinkaya/secure-auth';

const client = useSecureClient();

// Subscribe to state changes
const unsubscribe = client.subscribe((state) => {
  console.log('Login state:', state.loggedIn);
  console.log('User data:', state.userData);
});

// Login
const result = await client.login('username', 'password');
if (result.success) {
  console.log('Logged in:', result.data);
}

// Logout
await client.logout();

// Cleanup
unsubscribe();
```

### Advanced Usage

```typescript
import { 
  getSecureClientManager, 
  ErrorMessages,
  isValidUsername 
} from '@ugursahinkaya/secure-auth';

// Get manager instance
const manager = getSecureClientManager();

// Validate input
if (!isValidUsername(username)) {
  console.error('Invalid username');
  return;
}

// Make custom API call
try {
  const response = await manager.apiCall('/custom-endpoint', { data: '...' });
} catch (error) {
  console.error(ErrorMessages.API_CALL_FAILED, error);
}
```

## API Reference

### `useSecureClient()`

Returns a `SecureClientAPI` instance.

#### Methods

- **`init()`**: Initialize the client manually
- **`login(username, password)`**: Authenticate user
- **`logout()`**: End user session
- **`subscribe(listener)`**: Subscribe to state changes
- **`getState()`**: Get current state snapshot
- **`reset()`**: Reset state to initial values
- **`fetch(path, data, extraArgs?)`**: Make API call
- **`call(process, data)`**: Make recursive API call
- **`dispatchEvent(name, detail)`**: Dispatch custom event

### State Interface

```typescript
interface LoginState {
  loading: boolean;
  error: string;
  success: boolean;
  isReady: boolean;
  loggedIn: boolean;
  hostElement: HTMLElement | null;
  domain?: string;
  token?: string;
  userData?: UserData;
}
```

## Native Integration

The library automatically detects and integrates with:

- Flutter (InAppWebView)
- React Native
- iOS (WKWebView)
- Android WebView
- Capacitor
- Electron
- Tauri

## Error Handling

```typescript
import { getErrorMessage, isNetworkError } from '@ugursahinkaya/secure-auth';

try {
  await client.login(username, password);
} catch (error) {
  if (isNetworkError(error)) {
    console.error('Network error:', getErrorMessage(error));
  }
}
```

## License

GPL-3.0 or Commercial
