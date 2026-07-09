import { cn } from "@/shared/lib/utils";

import { getIcon, type IconName } from "./icons";

type EditorIconProps = {
  name: IconName;
  className?: string;
  iconPosition?: "inline-start" | "inline-end";
};

const editorIconClassName =
  "inline-grid place-items-center pointer-events-none [&_circle]:fill-none [&_ellipse]:fill-none [&_path]:fill-none [&_rect]:fill-none [&_svg]:size-5! [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.9] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]";

export function EditorIcon({ name, className, iconPosition }: EditorIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(editorIconClassName, className)}
      data-icon={iconPosition}
      dangerouslySetInnerHTML={{ __html: getIcon(name) }}
    />
  );
}
