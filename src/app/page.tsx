import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-between p-24">
            <section>
                <Link
                    href="/events"
                    className="block bg-neutral-700 py-3 px-10 border border-black"
                >
                    Events
                </Link>
            </section>
        </div>
    );
}
