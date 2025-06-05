import Link from "next/link"

export function AppFooter() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="w-full text-center text-sm text-muted-foreground px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <p className="mb-4">Made with ❤️ for seekers of the Word.</p>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Use
          </Link>
        </div>
        <div className="mb-6">
          <p className="italic">"Thy word is a lamp unto my feet, and a light unto my path."</p>
          <p className="mt-1">Psalm 119:105</p>
        </div>
        <p className="text-xs">&copy; {new Date().getFullYear()} BibScrip. All rights reserved.</p>
      </div>
    </footer>
  )
}
