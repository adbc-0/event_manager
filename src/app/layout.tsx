import { Viewport } from "next";
import { Fira_Sans_Condensed } from "next/font/google";

import Providers from "./providers";
import "./globals.css";

const firaSans = Fira_Sans_Condensed({ weight: "400", subsets: ["latin"] });

// ToDo: Validate is such user exists as is saved in local storage
// ToDo: Show source of decision (rule)
// ToDo: Add TanStack Query for request caching
// ToDo: Fix import paths, With query add global error handling
// ToDo: Block buttons when submitting
// ToDo: Add toast
// ToDo: Reuse animations from shad
// ToDo: Add labels to know the origin of selection
// ToDo: Forced dark mode
// ToDo: Go throught all files and make cleanup
// ToDo: Prevent going back and checking dates that differ more than half a year
// ToDo: Swipe on calendar to change month
// ToDo: Show incoming days on list view details or allow to change months
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
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
