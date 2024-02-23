import { Viewport } from "next";
import { Fira_Sans_Condensed } from "next/font/google";

import Providers from "./providers";
import "./globals.css";

const appFont = Fira_Sans_Condensed({ weight: "400", subsets: ["latin"] });

// ToDo: Forced dark mode
// ToDo: Prevent going back and checking dates that differ more than half a year, Remove old records
// ToDo: Swipe on calendar to change month
// ToDo: Revalidate users cache, Create endpoint to add new user
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
            <body className={`${appFont.className} min-h-full-dvh`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

// Ways to break app:
// Someone tweaks local storage values
