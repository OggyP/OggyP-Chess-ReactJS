// format date function
function formatDate(timestamp: number | Date) {
    let event = new Date(timestamp);
    let today = new Date();
    let yesterday = new Date(Date.now() - 864e5);

    const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    };

    let date = event.toLocaleDateString(undefined, options).split(', ');
    let currentDate = today.toLocaleDateString(undefined, options).split(', ');
    let yesterDate = yesterday.toLocaleDateString(undefined, options).split(', ');

    let day: string;
    if (date[1] === currentDate[1])
        day = "Today";
    else if (date[1] === yesterDate[1])
        day = "Yesterday";
    else
        day = "on " + date[0] + ", " + date[1];

    return date[2] + " " + day;
}

export { formatDate }