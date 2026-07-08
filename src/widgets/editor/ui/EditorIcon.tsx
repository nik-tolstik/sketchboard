import { cn } from "@/shared/lib/utils";

import { getIcon, type IconName } from "./icons";

type EditorIconProps = {
  name: IconName;
  className?: string;
  iconPosition?: "inline-start" | "inline-end";
};

export function EditorIcon({ name, className, iconPosition }: EditorIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("editor-icon", className)}
      data-icon={iconPosition}
      dangerouslySetInnerHTML={{ __html: getIcon(name) }}
    />
  );
}
