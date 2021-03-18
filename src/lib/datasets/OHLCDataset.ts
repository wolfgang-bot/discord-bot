import Dataset from "./Dataset"
import { TimestampObject } from "./utils"

export type EmptyDataObject = {
    time: number
}

export type OHLCDataObject = EmptyDataObject | {
    time: number,
    open: number,
    high: number,
    low: number,
    close: number,
}

/**
 * **Open-High-Low-Close (OHLC) dataset.** Each data-object consists of the following values:  
 * 
 * **time**: Timestamp corresponding to the object  
 * **open**: Opening value (the first numeric value; the close-value of the previous object)  
 * **high**: Highest numeric value  
 * **low**: Lowest numeric value  
 * **close**: Closing value (the last numeric value)
 */
class OHLCDataset<T extends TimestampObject> extends Dataset<OHLCDataObject, T> {
    createDataObject(time: number, values: T[]): OHLCDataObject {
        if (!values || values.length === 0) {
            return { time }
        } else {
            const newValues = values.map(this.getNumericValue)
            return {
                time,
                open: newValues[0],
                close: newValues[newValues.length - 1],
                high: Math.max(...newValues),
                low: Math.min(...newValues)
            }
        }
    }
}

export default OHLCDataset
