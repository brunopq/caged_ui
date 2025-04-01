import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "?ile:text-stone-950 placeholder:text-stone-500 selection:bg-stone-900 selection:text-stone-50 border-stone-200 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,background] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:file:text-stone-50 dark:placeholder:text-stone-400 dark:selection:bg-stone-50 dark:selection:text-stone-900 dark:bg-stone-900/30 dark:hover:bg-stone-900/50 dark:focus:bg-stone-900/75 dark:border-stone-900",
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 dark:aria-invalid:ring-red-900/20 dark:dark:aria-invalid:ring-red-900/40 dark:aria-invalid:border-red-900",
        className
      )}
      {...props}
    />
  )
}

export { Input }
