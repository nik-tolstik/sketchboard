export function AppIdentity() {
  return (
    <section
      className={
        "pointer-events-auto inline-flex min-h-11 items-center gap-2.5 justify-self-start rounded-lg py-2 pr-3 pl-2 max-[760px]:hidden"
      }
    >
      <img className="block size-7 rounded-md" src="/logo.svg" alt="logo" />
      <span className="text-sm font-bold tracking-normal text-foreground">SketchBoard</span>
    </section>
  );
}
