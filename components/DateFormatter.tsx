import React from 'react';

type DateFormatterProps = {
    date: string;
    debug?: boolean;
};

const DateFormatter: React.FC<DateFormatterProps> = ({
    date,
    debug = false,
}) => {
    // Parse the input date as UTC
    const inputDate = new Date(date + 'Z'); // Append 'Z' to treat the input as UTC
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert UTC to local time
    const localDate = new Date(
        inputDate.toLocaleString('en-US', { timeZone: userTimezone })
    );

    // Format the date string using toLocaleString
    const formattedString = localDate.toLocaleString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: userTimezone,
    });

    if (debug) {
        return (
            <div className="debug-date-formatter">
                <p>
                    <strong>Input Date String (UTC):</strong> {date}
                </p>
                <p>
                    <strong>User Timezone:</strong> {userTimezone}
                </p>
                <p>
                    <strong>UTC Time:</strong> {inputDate.toUTCString()}
                </p>
                <p>
                    <strong>Local Time:</strong> {localDate.toString()}
                </p>
                <p>
                    <strong>Formatted Local Time:</strong> {formattedString}
                </p>
                <p>
                    <strong>Time Difference:</strong> GMT
                    {-localDate.getTimezoneOffset() > 0 ? '+' : '-'}
                    {Math.abs(localDate.getTimezoneOffset() / 60)
                        .toString()
                        .padStart(2, '0')}
                    :00
                </p>
            </div>
        );
    }

    return (
        <span title={`UTC: ${inputDate.toUTCString()}`}>{formattedString}</span>
    );
};

export default DateFormatter;
