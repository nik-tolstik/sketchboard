export const controlGroupClassName = "grid min-w-0 gap-2 border-b border-border px-3 py-2.5";

export const controlHeaderClassName =
  "flex min-h-4 w-full items-center justify-between gap-2 text-[12px] leading-none font-semibold text-muted-foreground";

export const colorSwatchesClassName =
  "grid grid-cols-[repeat(7,20px)] gap-1 max-[760px]:grid-cols-7 max-[760px]:gap-1.5";

export const swatchClassName =
  "relative size-5 cursor-pointer overflow-hidden rounded-md border border-border p-0 transition-[box-shadow,transform,border-color] duration-150 hover:scale-[1.04] hover:border-ring hover:shadow-md active:translate-y-px aria-pressed:border-transparent aria-pressed:shadow-[0_0_0_2px_var(--popover),0_0_0_4px_var(--primary)] max-[760px]:size-[22px]";

export const transparentSwatchClassName =
  "[background-image:linear-gradient(135deg,transparent_calc(50%_-_1px),var(--destructive)_calc(50%_-_1px),var(--destructive)_calc(50%_+_1px),transparent_calc(50%_+_1px)),repeating-conic-gradient(var(--background)_0%_25%,var(--muted)_0%_50%)] [background-position:0_0] [background-size:100%_100%,8px_8px]";

export const strokeWidthOptionClassName =
  "grid h-8 min-w-0 cursor-pointer place-items-center rounded-[7px] border border-transparent bg-muted p-0 text-foreground transition-[background-color,color,box-shadow,transform] duration-150 hover:bg-accent active:translate-y-px aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-md";

export const iconButtonClassName =
  "inline-grid h-9 min-w-9 cursor-pointer place-items-center rounded-[7px] border-0 bg-muted text-foreground transition-[background-color,color,transform] duration-150 hover:bg-accent active:translate-y-px disabled:cursor-default disabled:text-muted-foreground disabled:opacity-100";

export const segmentButtonClassName =
  "inline-grid h-8 min-w-0 cursor-pointer place-items-center rounded-[7px] border-0 bg-muted text-foreground transition-[background-color,color,transform] duration-150 hover:bg-accent active:translate-y-px aria-pressed:bg-primary aria-pressed:text-primary-foreground";

export const actionButtonClassName =
  "inline-grid h-9 min-w-0 grid-flow-col place-items-center gap-1.5 rounded-[7px] px-2 text-[13px] font-bold";
