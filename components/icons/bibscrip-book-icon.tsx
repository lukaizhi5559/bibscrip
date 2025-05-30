import type React from "react"
export function BibscripBookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5" // Adjusted for a slightly bolder look if needed, can be 2
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Book Cover */}
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
      {/* Cross */}
      <line x1="12" y1="6" x2="12" y2="14" strokeWidth="2" />
      <line x1="9" y1="10" x2="15" y2="10" strokeWidth="2" />
      {/* Bookmark */}
      <path d="M12 17v5l-2-1-2 1V17" />
      {/* Optional: Page lines on top if desired, can be subtle */}
      <line x1="7" y1="4" x2="19" y2="4" strokeWidth="0.5" opacity="0.7" />
      <line x1="7" y1="5" x2="19" y2="5" strokeWidth="0.5" opacity="0.5" />
    </svg>
  )
}
