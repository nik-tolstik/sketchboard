import { cn } from "@/shared/lib/utils";

import { getIcon, type IconName } from "./icons";

type EditorIconProps = {
  name: IconName;
  className?: string;
  iconPosition?: "inline-start" | "inline-end";
};

const editorIconClassName = "inline-grid place-items-center pointer-events-none [&_svg]:size-5";

export function EditorIcon({ name, className, iconPosition }: EditorIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(editorIconClassName, className)}
      data-icon={iconPosition}
    >
      {getIcon(name)}
    </span>
  );
}
