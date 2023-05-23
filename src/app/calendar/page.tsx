async function fetchCalendar() {
    const response = await fetch('http://localhost:3000/api/calendar', {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('failed to fetch the data');
    }

    return response.json();
}

export default async function Calendar() { 
    const calendar = await fetchCalendar();
    return (
        <div>
            <h1>Calendar</h1>
            <p>{calendar.month_name}</p>
        </div>
    );
}
