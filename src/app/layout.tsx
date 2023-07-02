import "./globals.css";
import { Fira_Sans_Condensed } from "next/font/google";

import { Button } from "~/components/Button/Button";

const firaSans = Fira_Sans_Condensed({ weight: "400", subsets: ["latin"] });

export const metadata = {
    title: "Chaos",
    description: "Chaos manager",
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
                    <div className="fixed bottom-0 w-full">
                        <div className="flex w-full">
                            <Button theme="BASIC" className="grow py-3 m-2">Login</Button>
                        </div>
                    </div>
            </body>
        </html>
    );
}
