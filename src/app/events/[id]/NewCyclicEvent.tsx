// import { useState } from "react";

// type Rule = {
//     freq: null | number;
//     interval: null | number;
//     byDay: null | number;
//     byMonth: null | number;
//     byMonthDay: null | number;
// };

// const nilRule: Rule = {
//     byDay: null,
//     byMonth: null,
//     byMonthDay: null,
//     freq: null,
//     interval: null,
// } as const;

// https://www.kanzaki.com/docs/ical/rrule.html
export function NewCyclicEvent() {
    // const [rule, setRule] = useState<Rule>(nilRule);

    // const resetRule = () => {
    // setRule(nilRule);
    // };

    return (
        <div>
            <div>
                <label htmlFor="FREQ">Repeat my event:</label>
                <select id="FREQ">
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                </select>
            </div>
            <div>
                <button type="button">MON</button>
                <button type="button">TUE</button>
                <button type="button">WED</button>
                <button type="button">THU</button>
                <button type="button">FRI</button>
                <button type="button">SUN</button>
                <button type="button">SAT</button>
            </div>
            <div>
                <label htmlFor="INTER">Interval:</label>
                <select id="INTER">
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>
            </div>
            <div>
                <label htmlFor="AVAILABILITY">Availability:</label>
                <select id="AVAILABILITY">
                    <option value="1">Available</option>
                    <option value="2">Not Available</option>
                </select>
            </div>
        </div>
    );
}
