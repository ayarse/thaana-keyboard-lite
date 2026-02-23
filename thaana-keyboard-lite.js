const LATIN = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,;?<>[](){}";
const THAANA = "ްއެރތޔުިޮޕަސދފގހޖކލޒ×ޗވބނމޤޢޭޜޓޠޫީޯ÷ާށޑﷲޣޙޛޚޅޡޘޝޥޞޏޟ،؛؟><][)(}{";
const THAANA_CHARS = [...THAANA];

/** @type {Record<string, string>} */
const THAANA_KEYMAP = Object.fromEntries(
  [...LATIN].map((ch, i) => [ch, THAANA_CHARS[i]]),
);

/** @param {InputEvent} event */
function handleBeforeInput(event) {
  if (!['insertCompositionText', 'insertText'].includes(event.inputType))
    return;

  const latin = event.data?.charAt(event.data.length - 1);
  if (!latin) return;

  const thaana = THAANA_KEYMAP[latin];
  if (!thaana) return;

  event.preventDefault();
  document.execCommand('insertText', false, thaana);
}

/**
 * Converts input fields to Thaana (Dhivehi) keyboard inputs.
 * Maps Latin key presses to their corresponding Thaana unicode characters.
 *
 * @param {{ selector?: string | string[], element?: Element | Element[] }} [config]
 * @returns {() => void} Cleanup function that removes all event listeners
 */
function thaanaKeyboard(config = {}) {
  /** @type {Element[]} */
  const elements = [];

  if (config.element) {
    const el = config.element;
    elements.push(...(Array.isArray(el) ? el : [el]));
  } else {
    const selectors = config.selector ?? '.thaana-keyboard';
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const s of list) {
      elements.push(...document.querySelectorAll(s));
    }
  }

  for (const el of elements) {
    el.addEventListener('beforeinput', handleBeforeInput);
  }

  return () => {
    for (const el of elements) {
      el.removeEventListener('beforeinput', handleBeforeInput);
    }
  };
}

export { thaanaKeyboard };

if (typeof window !== 'undefined') {
  window.thaanaKeyboard = thaanaKeyboard;
}
