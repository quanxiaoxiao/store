# State Management Library Documentation

## Overview
This library provides a flexible and type-safe state management solution for JavaScript/Node.js applications, with built-in schema validation and nested state handling.

## Key Components

### `createStateDispatch`
A core function for creating a state management dispatcher with optional schema validation.

#### Features:
- Supports nested state updates
- Validates state changes using JSON schemas
- Handles both direct and functional state updates
- Preserves immutability

#### Example:
```javascript
const dispatch = createStateDispatch({
  name: 'John',
  age: 30
}, {
  age: {
    type: 'integer',
    minimum: 18,
    maximum: 100
  }
});

// Update state directly
let newState = dispatch('name', 'Jane');

// Update state with a function
newState = dispatch('age', (prev) => prev + 1);
```

### `getReducer`
Creates a Redux-compatible reducer function.

#### Features:
- Converts `createStateDispatch` into a Redux reducer
- Supports standard Redux action patterns

#### Example:
```javascript
const [reducer, initialState] = getReducer({
  user: { name: 'John' }
});

const store = createStore(reducer, initialState);
```

### `createStore`
A simplified store creation utility with built-in middleware support.

#### Features:
- Creates a Redux store with initial state
- Optional schema validation
- Middleware integration
- Simplified dispatch method

#### Example:
```javascript
const store = createStore({
  initialState: { user: { name: 'John' } },
  schemas: {
    'user.age': { type: 'integer', minimum: 18 }
  },
  middlewares: [thunk, logger]
});
```

## Schema Validation
The library uses [Ajv](https://ajv.js.org/) for JSON schema validation, allowing type checking and value constraints.

### Validation Examples:
```javascript
{
  // Ensure age is an integer between 18 and 55
  age: {
    type: 'integer',
    minimum: 18,
    maximum: 55
  },
  
  // Validate nested object properties
  'user.email': {
    type: 'string',
    format: 'email'
  }
}
```

## Key Utilities

### `convertActionName`
Escapes dot notation for nested state paths.

### `setValue`
Immutably updates nested state structures.

### `generateActionHandlerList`
Recursively generates action handlers for nested state.

## Installation
```bash
npm install @quanxiaoxiao/store
```

## Dependencies
- Ajv: JSON schema validation
- Lodash: Object manipulation utilities
- Redux (optional): State management

## Error Handling
- Throws descriptive errors for invalid state updates
- Prevents updates that don't pass schema validation

## Performance Considerations
- Immutable state updates
- Efficient nested state traversal
- Minimal performance overhead from validation

## License
[Your License Here]

## Contributing
[Contribution Guidelines]
