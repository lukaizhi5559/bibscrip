import Link from "next/link"

export function AppFooter() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="w-full text-center text-sm text-muted-foreground px-4 sm:px-6 lg:px-8">
        <p className="mb-2">Made with ❤️ for seekers of the Word.</p>
        <div className="flex justify-center gap-4 mb-4">
          <Link href="#privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="#about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link href="#support" className="hover:text-primary transition-colors">
            Support BibScrip
          </Link>
        </div>
        <p className="italic">"Thy word is a lamp unto my feet, and a light unto my path."</p>
        <p className="mt-1">Psalm 119:105</p>
      </div>
    </footer>
  )
}
