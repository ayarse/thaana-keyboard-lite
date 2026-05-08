import { useEffect, useRef, useState } from "react";
import { thaanaKeyboard } from "thaana-keyboard-lite";

function ThaanaInput({ id, label, multiline, value, onChange, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    return thaanaKeyboard({ element: ref.current });
  }, []);

  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag
        id={id}
        ref={ref}
        dir="rtl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <div className="preview">
        <strong>Value</strong>
        {value || "—"}
      </div>
    </div>
  );
}

export function App() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  return (
    <>
      <ThaanaInput
        id="name"
        label="Name"
        value={name}
        onChange={setName}
        placeholder="ނަން"
      />
      <ThaanaInput
        id="message"
        label="Message"
        multiline
        value={message}
        onChange={setMessage}
        placeholder="މެސެޖު..."
      />
    </>
  );
}
