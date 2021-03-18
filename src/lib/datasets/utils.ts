export type TimestampObject = {
    timestamp: number
}

export type DayMap<T> = Map<number, T | null>

export const MILLISECONDS_PER_HOUR = 60 * 60 * 1000
export const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR

/**
 * Round a UNIX timestamp to the last full hour
 */
export function roundToLastFullHour(timestamp: number) {
    const date = new Date(timestamp)
    const deltaSeconds = date.getMinutes() * 60 + date.getSeconds()
    const deltaMilliseconds = deltaSeconds * 1000 + date.getMilliseconds()
    return timestamp - deltaMilliseconds
}

/**
 * Round a UNIX timestamp to the last full day
 */
export function roundToLastFullDay(timestamp: number) {
    const date = new Date(timestamp)
    const deltaMilliseconds = date.getHours() * 60 * 60 * 1000
    return roundToLastFullHour(timestamp) - deltaMilliseconds
}

/**
 * Create an array with an element for each day between the two given
 * timestamps. The elements are timestamps representing 00:00 at each day.
 *
 * --Example--
 *
 * Input:
 * 
 * UNIX for 01.01.2021
 * UNIX for 03.01.2021
 * 
 * Output:
 * 
 * [
 *      UNIX for 01.01.2021,
 *      UNIX for 02.01.2021,
 *      UNIX for 03.01.2021
 * ]
 */
export function getDaysBetweenTimestamps(
    fromTimestamp: number,
    toTimestamp: number
) {
    const result: number[] = []

    const from = roundToLastFullDay(fromTimestamp)
    const to = roundToLastFullDay(toTimestamp)

    for (let i = 0; i < (to - from + 1) / MILLISECONDS_PER_DAY; i++) {
        const newKey = from + i * MILLISECONDS_PER_DAY
        result.push(newKey)
    }

    return result
}

/**
 * Create a map with a key and `null` value for each day between the
 * two given timestamps. The keys are timestamps for 00:00 at each day.
 * 
 * --Example--
 * 
 * Input:
 * 
 * UNIX for 01.01.2021
 * UNIX for 03.01.2021
 * 
 * Output:
 * 
 * Map: {
 *      [UNIX for 01.01.2021]: null,
 *      [UNIX for 02.01.2021]: null,
 *      [UNIX for 03.01.2021]: null
 * }
 */
export function createEmptyDayMap<T>(
    fromTimestamp: number,
    toTimestamp: number
) {
    const result: DayMap<T> = new Map()

    const keys = getDaysBetweenTimestamps(fromTimestamp, toTimestamp)

    for (let key of keys) {
        result.set(key, null)
    }

    return result
}

/**
 * Create a map where the keys are timestamps for each day at 00:00 since
 * the earliest timestamp in the given array. The values are all timestamps
 * included in the given array which are in between the beginning and the
 * end of the day.
 * Assumes that the given array of timestamps is sorted in ascending order.
 * 
 * --Example--
 *
 * Input:
 * 
 * timestamps: [
 *      UNIX between 01.01.2021 00:00:00 and 01.01.2021 23:59:59,
 *      UNIX between 01.01.2021 00:00:00 and 01.01.2021 23:59:59,
 *      UNIX between 01.01.2021 00:00:00 and 01.01.2021 23:59:59,
 *      UNIX between 03.01.2021 00:00:00 and 03.01.2021 23:59:59
 * ]
 * 
 * Output:
 * 
 * Map: {
 *      [UNIX for 01.01.2021]: [
 *          UNIX between 01.01.2021 00:00:00 and 01.01.2021 23:59:59,
 *          UNIX between 01.01.2021 00:00:00 and 01.01.2021 23:59:59,
 *          UNIX between 01.01.2021 00:00:00 and 01.01.2021 23:59:59
 *      ],
 *      [UNIX for 02.01.2021]: null,
 *      [UNIX for 03.01.2021]: [
 *          UNIX between 03.01.2021 00:00:00 and 03.01.2021 23:59:59
 *      ]
 * }
 */
export function chunkTimestampsIntoDays<T extends TimestampObject>(data: T[]) {
    if (data.length === 0) {
        return new Map() as DayMap<T[]>
    }

    const dayMap = createEmptyDayMap<T[]>(
        data[0].timestamp,
        Date.now()
    )

    const days = Array.from(dayMap.keys())
    let currentDayIndex = 0

    for (let entry of data) {
        while (entry.timestamp >= days[currentDayIndex + 1]) {
            currentDayIndex++
        }

        const currentDay = days[currentDayIndex]

        let currentDayEntries = dayMap.get(currentDay)

        if (!currentDayEntries) {
            currentDayEntries = []
            dayMap.set(currentDay, currentDayEntries)
        }

        currentDayEntries.push(entry)
    }

    return dayMap
}
