# css-vars-worker

Incremental CSS loader with CSS variable replacement and Worker support (IE11 compatible, TypeScript).

## Features

- Incrementally process `<link>` and `<style>` CSS
- Replace CSS variables (`var(--name)`) dynamically
- Remove comments and empty lines
- Automatically update when new link/style nodes appear
- Supports IE11
- Each `<style>` has a readable `data-time` timestamp

## Installation

```bash
npm install css-vars-worker
```
## Usage

```typescript
import {cssVars} from 'css-vars-worker';

cssVars({'--primary-color': '#ff0000', '--bg-color': '#eeeeee'});


```
