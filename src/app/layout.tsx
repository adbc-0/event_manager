import "./globals.css";
import { Fira_Sans_Condensed } from "next/font/google";

const firaSans = Fira_Sans_Condensed({ weight: "400", subsets: ["latin"] });

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
