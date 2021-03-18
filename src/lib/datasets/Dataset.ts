import { chunkTimestampsIntoDays, TimestampObject } from "./utils"

abstract class Dataset<TDataObject, TDataInput extends TimestampObject> {
    abstract createDataObject(time: number, values: TDataInput[]): TDataObject
    
    constructor(
        protected data: TDataInput[],
        protected getNumericValue: (value: TDataInput) => number
    ) {}

    createDataset() {
        const dayMap = chunkTimestampsIntoDays(this.data)

        const dataset: TDataObject[] = []

        dayMap.forEach((values, time) => {
            dataset.push(this.createDataObject(time, values))
        })

        return dataset
    }

    toJSON() {
        return this.createDataset()
    }
}

export default Dataset
