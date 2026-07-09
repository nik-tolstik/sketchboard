import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

import { controlGroupClassName, controlHeaderClassName } from "./objectSettingsClasses";

type ObjectSettingsSectionProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  children: ReactNode;
  headerEnd?: ReactNode;
  title: string;
  titleId: string;
};

export function ObjectSettingsSection({
  children,
  className,
  headerEnd,
  title,
  titleId,
  ...props
}: ObjectSettingsSectionProps) {
  return (
    <div
      aria-labelledby={titleId}
      className={cn(controlGroupClassName, className)}
      role="group"
      {...props}
    >
      <div className={controlHeaderClassName}>
        <h3 className="m-0 text-[12px] leading-none font-semibold" id={titleId}>
          {title}
        </h3>
        {headerEnd}
      </div>
      {children}
    </div>
  );
}
