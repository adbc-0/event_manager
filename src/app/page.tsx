import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-between p-24">
            <section>
                <Link href="/events">Events</Link>
            </section>
        </div>
    );
}
