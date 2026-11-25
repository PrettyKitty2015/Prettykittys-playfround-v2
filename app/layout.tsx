import './globals.css'

export const metadata = {
  title: "PrettyKitty’s Playground",
  description: "Where imagination runs wild",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
