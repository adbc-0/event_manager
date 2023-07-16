import Link from "next/link";

export const metadata = {
    title: "Chaos",
    description: "Chaos manager",
};

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-between p-24">
            <section>
                <Link
                    href="/events"
                    className="block bg-neutral-700 py-3 px-10 border border-zinc-900"
                >
                    Events
                </Link>
            </section>
        </div>
    );
}

// ToDo:
// Anonymous user should be able to access only calendar
// If tries to access unaccessible part then send to /login
