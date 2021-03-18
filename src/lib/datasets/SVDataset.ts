import Dataset from "./Dataset"
import { TimestampObject } from "./utils"

type Sign = -1 | 1 | 0

export type EmptyDataObject = {
    time: number
}

export type SVDataObject = EmptyDataObject | {
    time: number,
    value: number,
    trend: Sign
}

/**
 * **Single-Value (SV) dataset.** Each data-object consists of the following values:
 * 
 * **time**: Timestamp corresponding to the object  
 * **value**: Numeric value; Defaults to the amount of datapoints for a timestamp
 * if the ``getNumericValue`` parameter is not defined.  
 * **trend**: Represents the trend of the "value" attribute (-1, 1 or 0);
 * The value will always be 0 if the ``getTrendValue`` parameter is not defined.
 */
class SVDataset<T extends TimestampObject> extends Dataset<SVDataObject, T> {
    constructor(
        data: T[],
        getNumericValue?: (value: T) => number,
        private getTrendValue?: (value: T) => number
    ) {
        super(data, getNumericValue)
    }

    sum(numbers: number[]) {
        return numbers.reduce((sum, current) => sum + current, 0)
    }

    getValue(values: T[]) {
        return !this.getNumericValue ?
            values.length :
            this.sum(values.map(this.getNumericValue))
    }

    getTrend(values: T[]) {
        return !this.getTrendValue ?
            0 :
            Math.sign(this.sum(values.map(this.getTrendValue))) as Sign
    }

    createDataObject(time: number, values: T[]): SVDataObject {
        if (!values || values.length === 0) {
            return { time }
        } else {
            return {
                time,
                value: this.getValue(values),
                trend: this.getTrend(values)
            }
        }
    }
}

export default SVDataset
