export default class Collection<T> extends Array<T> {
    public isSorted: boolean = false

    /**
     * Map over elements with an async function
     */
    async mapAsync(fn: (value?: T, index?: number, array?: T[]) => unknown) {
        return Promise.all(this.map(fn))
    }
}