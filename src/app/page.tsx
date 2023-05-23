import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <section>
                <Link href="/calendar">Calendar</Link>
                <div>Here is rendered calendar view</div>
            </section>
            <section>
                <Link href="/notes">Notes</Link>
                <div>Here is last note visible</div>
            </section>
            <section>
                <Link href="/recipes">Recipes</Link>
            </section>
        </main>
    )
}
