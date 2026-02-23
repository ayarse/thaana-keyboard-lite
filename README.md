# thaana-keyboard-lite ✨

A tiny (~40 lines, 1.1 KB minified, zero dependencies) Thaana keyboard library for the web.

## Why another Thaana keyboard?

There are several existing Thaana keyboard libraries for JavaScript. All of them were written in a different era of the web and carry baggage that makes them awkward to use in modern projects.

**[thaana-keyboard](https://github.com/aharen/thaana-keyboard)** (aharen) — No dependencies, TypeScript source. Uses a two-phase approach (`beforeinput` to capture + `input` to replace) with manual string splicing to swap characters. This breaks the browser's native undo/redo stack and requires careful cursor tracking. No ES module support, no cleanup API.

**[thaanaKeyboard](https://github.com/ajaaibu/thaanaKeyboard)** (ajaaibu) — Requires jQuery and distributed through Bower. Same manual value replacement approach that breaks undo/redo. No IME or mobile keyboard support, no cleanup API.

**[JTK](https://github.com/jawish/jtk)** (jawish) — The most feature-rich of the three, with three keyboard layouts and per-element layout switching. Uses deprecated event APIs. No module system, no npm package, no IME support.

All three are awkward to use in modern projects. They share a common approach: intercept a key event, then manually replace the field's `.value` to swap in the Thaana character. But replacing `.value` resets the cursor to the end, so they all need manual bookkeeping — save cursor position, splice the string, restore cursor, handle selections. This also breaks the browser's native undo/redo stack, since the browser sees a programmatic value change rather than a user edit. None of them offer ES module exports, element ref support, or cleanup functions — things you need for clean integration with modern frameworks.

### What this library does differently

`thaana-keyboard-lite` ✨ takes a simpler approach. It listens for `beforeinput`, looks up the character in a keymap, and if there's a match, prevents the default and inserts the Thaana character with `execCommand('insertText')`. That's it. The browser handles cursor positioning, text selection, undo/redo, and scroll — no manual bookkeeping.

This means:

- **~40 lines of code** instead of hundreds
- **Zero dependencies** — no jQuery, no framework
- **Composition/IME support** — works with mobile keyboards and input methods
- **Undo/redo works** — because `execCommand` participates in the browser's undo stack
- **Selection replacement works** — selecting text and typing replaces it correctly, handled by the browser

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

## Why plain JS with JSDoc instead of TypeScript?

The library ships as a single `.js` file. No build step, no transpilation — what you see in the repo is exactly what runs in the browser and what gets published to npm. JSDoc gives us type checking during development (via `tsc --checkJs` or editor support) without adding a compile step or requiring consumers to deal with `.d.ts` files, source maps, or a `dist/` folder.

## Keymap

Standard Dhivehi phonetic layout. Lowercase, uppercase, and punctuation — 62 mappings total. Brackets and parentheses are swapped for RTL.

## License

MIT
