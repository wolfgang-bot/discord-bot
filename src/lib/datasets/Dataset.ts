import { TimestampObject } from "./utils"

abstract class Dataset<TDataset, TDataInput extends TimestampObject> {
    constructor(
        protected data: TDataInput[]
    ) {}

    abstract createDataset(): TDataset

    toJSON() {
        return this.createDataset()
    }
}

export default Dataset
