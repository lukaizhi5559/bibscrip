import { BibscripBookIcon } from "@/components/icons/bibscrip-book-icon"

export function BibScripLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { iconSize: "h-5 w-5", textSize: "text-lg" }, // 20px
    md: { iconSize: "h-6 w-6", textSize: "text-2xl" }, // 24px
    lg: { iconSize: "h-8 w-8", textSize: "text-3xl" }, // 32px
  }
  const currentSize = dimensions[size]

  return (
    <div className="flex items-center gap-2">
      <BibscripBookIcon
        className={`${currentSize.iconSize} text-primary dark:text-primary shrink-0`}
        // fill="currentColor" // Use fill if the SVG is designed for it, otherwise stroke
      />
      <span className={`font-semibold ${currentSize.textSize} text-foreground`}>BibScrip</span>
    </div>
  )
}
