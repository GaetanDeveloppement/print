import { LaunchProps } from "@raycast/api";
import { printText } from "./lib/print";

export default async function PrintCommand(props: LaunchProps<{ arguments: Arguments.Print }>) {
  const text = props.arguments.text ?? "";
  await printText(text, { quick: true });
}
