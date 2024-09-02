// helper function
function getTimeStringParts(dateObj: Date) {
    const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    };

    // returns either ['DAY', 'DATE at TIME'] or ['DAY', 'DATE', 'TIME']
    let dateArray = dateObj.toLocaleDateString(undefined, options).split(', ');

    let parts = {
        'day': dateArray[0],
        'date': '',
        'time': ''
    };

    if (dateArray.length === 2) {
        // if date and time are in one string
        let dateTimeArray = dateArray[1].split(' at ');
        parts.date = dateTimeArray[0];
        parts.time = dateTimeArray[1];
    } else {
        // if date and time are two separate strings
        parts.date = dateArray[1];
        parts.time = dateArray[2];
    }

    return parts;
}


/**
 * Creates a string from a timestamp.
 * @param timestamp - The time as either a date object, a unix timestamp or an ISO-8601 date-time.
 * @returns A string as HH:mm:ss on DAY, DD MMMM... YYYY.
 */
function formatDate(timestamp: Date | number | string): string {
    let today = new Date();
    let yesterday = new Date(Date.now() - 864e5);
    let event = (timestamp instanceof Date) ? timestamp : new Date(timestamp);

    let date = getTimeStringParts(event);
    let currentDate = getTimeStringParts(today);
    let yesterDate = getTimeStringParts(yesterday);

    let day: string;
    if (date.date === currentDate.date)
        day = "Today";
    else if (date.date === yesterDate.date)
        day = "Yesterday";
    else
        day = "on " + date.day + ", " + date.date;

    return date.time + " " + day;
}


/**
 * Creates a short string from a timestamp.
 * @param timestamp - The time as an ISO 8601 date/date-time in UTC. 
 * Dates are formatted YYYY-MM-DD, and are separated from times in date-times with a 'T'.
 * @returns A string as DD MMM 'YY.
 */
function formatDateShort(timestamp: string): string {
    let date = timestamp.split('T')[0];

    // ['YYYY', 'MM', 'DD']
    let dateArray = date.split('-');
    let monthStrings = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return dateArray[2] + ' ' + monthStrings[Number(dateArray[1]) - 1] + ' \'' + dateArray[0].substring(2, 4);
}


export { formatDate, formatDateShort }