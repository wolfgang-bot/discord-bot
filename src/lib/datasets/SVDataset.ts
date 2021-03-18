import Dataset from "./Dataset"
import { TimestampObject } from "./utils"

export type EmptyDataObject = {
    time: number
}

export type SVDataObject = EmptyDataObject | {
    time: number,
    value: number,
    up: number,
    down: number
}

/**
 * **Single-Value (SV) dataset.** Each data-object consists of the following values:
 * 
 * **time**: Timestamp corresponding to the object  
 * **value**: Numeric value; Defaults to the amount of datapoints for a timestamp
 * if the ``getNumericValue`` parameter is not defined.  
 * **up**: Amount of positive entities  
 * **down**: Amount of negative entities
 */
class SVDataset<T extends TimestampObject> extends Dataset<SVDataObject, T> {
    constructor(
        data: T[],
        getNumericValue?: (value: T) => number,
        private classifyEntity?: (value: T) => boolean
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

    getAmountUp(values: T[]) {
        return !this.classifyEntity ?
            null :
            this.sum(
                values.map(this.classifyEntity)
                .filter(Boolean)
                .map(bool => bool ? 1 : 0)
            )
    }

    getAmountDown(values: T[]) {
        return !this.classifyEntity ?
            null :
            values.length - this.getAmountUp(values)
    }

    createDataObject(time: number, values: T[]): SVDataObject {
        if (!values || values.length === 0) {
            return { time }
        } else {
            return {
                time,
                value: this.getValue(values),
                up: this.getAmountUp(values),
                down: this.getAmountDown(values)
            }
        }
    }
}

export default SVDataset
