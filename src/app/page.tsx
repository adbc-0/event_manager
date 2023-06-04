import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <section>
                <Link href="/events">Events</Link>
                <div>All available events</div>
            </section>
        </main>
    )
}
