const LATIN = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,;?<>[](){}';
const THAANA = 'ްއެރތޔުިޮޕަސދފގހޖކލޒ×ޗވބނމޤޢޭޜޓޠޫީޯ÷ާށޑﷲޣޙޛޚޅޡޘޝޥޞޏޟ،؛؟><][)(}{';
const THAANA_CHARS = [...THAANA];

/** @type {Record<string, string>} */
const THAANA_KEYMAP = Object.fromEntries(
  [...LATIN].map((ch, i) => [ch, THAANA_CHARS[i]]),
);

/** @param {string} str */
const transliterate = (str) =>
  [...str].map((ch) => THAANA_KEYMAP[ch] ?? ch).join('');

/** @param {InputEvent} event */
function handleBeforeInput(event) {
  if (event.inputType !== 'insertText' || !event.data) return;
  const thaana = transliterate(event.data);
  if (thaana === event.data) return;
  event.preventDefault();
  document.execCommand('insertText', false, thaana);
}

/** @param {Event} event */
function handleInput(event) {
  const el = /** @type {HTMLInputElement | HTMLTextAreaElement} */ (
    event.target
  );
  if (typeof el.value !== 'string') return;
  const repaired = transliterate(el.value);
  if (repaired === el.value) return;
  const { selectionStart, selectionEnd } = el;
  el.value = repaired;
  if (selectionStart !== null && selectionEnd !== null) {
    try {
      el.setSelectionRange(selectionStart, selectionEnd);
    } catch {}
  }
}

const HANDLERS = [
  ['beforeinput', handleBeforeInput],
  ['input', handleInput],
];

const toArray = (x) => (Array.isArray(x) ? x : [x]);

/**
 * Converts input fields to Thaana (Dhivehi) keyboard inputs.
 * Maps Latin key presses to their corresponding Thaana unicode characters.
 *
 * @param {{ selector?: string | string[], element?: Element | Element[] }} [config]
 * @returns {() => void} Cleanup function that removes all event listeners
 */
function thaanaKeyboard(config = {}) {
  /** @type {Element[]} */
  const elements = config.element
    ? toArray(config.element)
    : toArray(config.selector ?? '.thaana-keyboard').flatMap((s) => [
        ...document.querySelectorAll(s),
      ]);

  for (const el of elements) {
    for (const [evt, fn] of HANDLERS) el.addEventListener(evt, fn);
  }

  return () => {
    for (const el of elements) {
      for (const [evt, fn] of HANDLERS) el.removeEventListener(evt, fn);
    }
  };
}

export { thaanaKeyboard };

if (typeof window !== 'undefined') {
  window.thaanaKeyboard = thaanaKeyboard;
}
