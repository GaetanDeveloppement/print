import { Action, ActionPanel, closeMainWindow, Form } from "@raycast/api";
import { useState } from "react";
import { MAX_PRINT_LENGTH, printText } from "./lib/print";

export default function PrintMultilineCommand() {
  const [text, setText] = useState("");

  async function onSubmit(values: { text: string }) {
    const ok = await printText(values.text);
    if (ok) {
      await closeMainWindow();
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Print" onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="text"
        title="Text"
        placeholder="Enter the text to print (one or more lines)"
        autoFocus
        value={text}
        onChange={setText}
      />
      {text.length > MAX_PRINT_LENGTH ? (
        <Form.Description text={`⚠️ Text over ${MAX_PRINT_LENGTH} characters will be truncated by the printer.`} />
      ) : null}
    </Form>
  );
}
