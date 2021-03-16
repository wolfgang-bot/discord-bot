import Dataset from "./Dataset"
import { chunkTimestampsIntoDays, TimestampObject } from "./utils"

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

class OHLCDataset<T extends TimestampObject> extends Dataset<OHLCDataObject[], T> {
    constructor(
        data: T[],
        private getNumericValues: (values: T[]) => number[]
    ) {
        super(data)
    }

    createDataObject(time: number, values: T[]): OHLCDataObject {
        if (!values || values.length === 0) {
            return { time }
        } else {
            const newValues = this.getNumericValues(values)
            return {
                time,
                open: newValues[0],
                close: newValues[newValues.length - 1],
                high: Math.max(...newValues),
                low: Math.min(...newValues)
            }
        }
    }

    createDataset() {
        const dayMap = chunkTimestampsIntoDays(this.data)
        
        const dataset: OHLCDataObject[] = []

        dayMap.forEach((values, time) => {
            dataset.push(this.createDataObject(time, values))
        })

        return dataset
    }
}

export default OHLCDataset
