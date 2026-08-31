import { closeMainWindow, getPreferenceValues, showHUD, showToast, Toast } from "@raycast/api";

export const MAX_PRINT_LENGTH = 200;

export interface Preferences {
  baseUrl: string;
}

export interface PrintOptions {
  /** Close Raycast immediately and use a HUD for feedback (single-line quick print). */
  quick?: boolean;
}

export async function printText(text: string, options: PrintOptions = {}): Promise<boolean> {
  const { baseUrl } = getPreferenceValues<Preferences>();

  if (!baseUrl) {
    await showToast(Toast.Style.Failure, "Base URL not set", "Set Base URL in the extension preferences.");
    return false;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    await showToast(Toast.Style.Failure, "Texte vide", "Please enter some text to print.");
    return false;
  }

  const notify = async (style: Toast.Style, title: string, message?: string) => {
    if (options.quick) {
      if (style === Toast.Style.Success) {
        await showHUD(message ?? title);
      } else {
        await showToast(style, title, message);
      }
    } else {
      await showToast(style, title, message);
    }
  };

  if (options.quick) {
    await closeMainWindow();
  } else {
    await showToast(Toast.Style.Animated, "Printing…");
  }

  if (trimmed.length > MAX_PRINT_LENGTH) {
    await notify(Toast.Style.Warning, "Text too long", `Text will be truncated to ${MAX_PRINT_LENGTH} characters.`);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${baseUrl}/print`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: trimmed,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const body = await response.text();
      const message = body && body.startsWith("OK") ? "Printed: " + body.slice(3, 60) : "Printed";
      await notify(Toast.Style.Success, "Printed", message);
      return true;
    }

    if (response.status === 400) {
      await notify(Toast.Style.Failure, "Texte vide", "The printer rejected the empty text.");
    } else {
      await notify(Toast.Style.Failure, "Print failed", `Server responded with ${response.status}.`);
    }
    return false;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      await notify(Toast.Style.Failure, "Timeout", "The printer took too long to respond. Is it on?");
    } else {
      await notify(Toast.Style.Failure, "Printer unreachable", "Check the base URL and your connection.");
    }
    return false;
  }
}
