# thaana-keyboard-lite ✨

A tiny (~80 lines, ~1 KB minified, zero dependencies) Thaana keyboard library for the modern web.

**[Live demos →](https://ayarse.github.io/thaana-keyboard-lite/)** — Vanilla JS, React, and Vue examples.

## Why another Thaana keyboard?

There are several existing Thaana keyboard libraries for JavaScript. All of them were written in a different era of the web and carry baggage that makes them awkward to use in modern projects, so I wanted to make something that was easier to work with modern stacks and frontend frameworks.

**[thaana-keyboard](https://github.com/aharen/thaana-keyboard)** (aharen) — No dependencies, TypeScript source. Uses a two-phase approach (`beforeinput` to capture + `input` to replace) with manual string splicing to swap characters. This breaks the browser's native undo/redo stack and requires careful cursor tracking. No ES module support, no cleanup API.

**[thaanaKeyboard](https://github.com/ajaaibu/thaanaKeyboard)** (ajaaibu) — Requires jQuery and distributed through Bower. Same manual value replacement approach that breaks undo/redo. No IME or mobile keyboard support, no cleanup API.

**[JTK](https://github.com/jawish/jtk)** (jawish) — The most feature-rich of the three, with three keyboard layouts and per-element layout switching. Uses deprecated event APIs. No module system, no npm package, no IME support.

All three are awkward to use in modern projects. They share a common approach: intercept a key event, then manually replace the field's `.value` to swap in the Thaana character. But replacing `.value` resets the cursor to the end, so they all need manual bookkeeping — save cursor position, splice the string, restore cursor, handle selections. This also breaks the browser's native undo/redo stack, since the browser sees a programmatic value change rather than a user edit. None of them offer ES module exports, element ref support, or cleanup functions — things you need for clean integration with modern frameworks.

That said, huge thanks to [aharen](https://github.com/aharen), [ajaaibu](https://github.com/ajaaibu), and [jawish](https://github.com/jawish) for their pioneering work. They solved a real problem for the Dhivehi developer community and this library builds directly on the foundation they laid.

### Design

`thaana-keyboard-lite` ✨ leans on the modern web platform instead of working around it. Two small listeners do the work:

- **`beforeinput`** intercepts ordinary Latin keypresses and inserts the Thaana character via `execCommand('insertText')`. The browser keeps owning the cursor, selection, scroll, and the native undo/redo stack — no manual bookkeeping.
- **`input`** runs a stateless repair sweep — scan the value, swap any mapped Latin character for its Thaana equivalent, restore the caret. This handles the cases `beforeinput` can't cleanly cancel: Android IME committing the composition buffer on space, paste, and drag-and-drop.

The field's own value is the source of truth. There's no shadow state to keep in sync, no class instance to manage, and no global listeners attached to `document`.

This means:

- **Tiny** — ~80 lines of source, ~1 KB minified, zero dependencies
- **Composition / IME support** — works with mobile keyboards
- **Undo/redo preserved** — `execCommand` participates in the browser's native history
- **Selection replacement, RTL caret, scroll** — handled by the browser, not us
- **Framework-friendly** — ESM, element refs, returns a cleanup function for `useEffect`

## Install

```bash
npm install thaana-keyboard-lite
```

## Usage

Add the class to your inputs or textareas:

```html
<input type="text" class="thaana-keyboard" dir="rtl" />
<textarea class="thaana-keyboard" dir="rtl"></textarea>
```

Then call:

```html
<script src="thaana-keyboard-lite.js"></script>
<script>
  thaanaKeyboard();
</script>
```

Or as an ES module:

```js
import { thaanaKeyboard } from "thaana-keyboard-lite";
thaanaKeyboard();
```

With a custom selector:

```js
thaanaKeyboard({ selector: "#my-thaana-input" });
```

Or multiple selectors:

```js
thaanaKeyboard({ selector: ["#name", "#address", ".dhivehi"] });
```

You can also pass DOM elements directly and get a cleanup function back — useful for frameworks like React:

```jsx
const ref = useRef(null);

useEffect(() => {
  return thaanaKeyboard({ element: ref.current });
}, []);

return <input ref={ref} dir="rtl" />;
```

`thaanaKeyboard()` returns a function that removes all event listeners, so it works as a `useEffect` cleanup out of the box. None of the existing Thaana keyboard libraries support this.

## Examples

Working examples for each integration live in [`examples/`](./examples):

- [`examples/vanilla`](./examples/vanilla) — plain HTML and a class selector
- [`examples/react`](./examples/react) — `useRef` + `useEffect` cleanup
- [`examples/vue`](./examples/vue) — template ref + `onMounted` / `onBeforeUnmount`

To preview locally, build them and serve the output:

```bash
bun run build:examples
bunx serve dist/examples
```

## Why plain JS with JSDoc instead of TypeScript?

The library ships as a single `.js` file. No build step, no transpilation — what you see in the repo is exactly what runs in the browser and what gets published to npm. JSDoc gives us type checking during development (via `tsc --checkJs` or editor support) without adding a compile step or requiring consumers to deal with `.d.ts` files, source maps, or a `dist/` folder.

## Keymap

Standard Dhivehi phonetic layout. Lowercase, uppercase, and punctuation — 62 mappings total. Brackets and parentheses are swapped for RTL.

## License

MIT
