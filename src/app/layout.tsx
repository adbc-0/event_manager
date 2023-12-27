import { Viewport } from "next";
import { Fira_Sans_Condensed } from "next/font/google";

import "./globals.css";

const firaSans = Fira_Sans_Condensed({ weight: "400", subsets: ["latin"] });

// ToDo: Add TanStack Query for request caching
// ToDo: Forced dark mode
// ToDo: Add labels to know the origin of selection
// ToDo: Block buttons when submitting
// ToDo: Add toast
export const viewport: Viewport = {
    colorScheme: "dark",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${firaSans.className} min-h-full-dvh`}>
                <main>{children}</main>
            </body>
        </html>
    );
}
