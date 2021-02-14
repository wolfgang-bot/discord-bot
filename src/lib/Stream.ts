export enum READING_STATES {
    FLOWING,
    PAUSED
}

export abstract class Readable<T> {
    destStreams: Writable<T>[] = []
    state: READING_STATES = READING_STATES.PAUSED

    abstract construct(): void
    abstract destroy(): void

    push(data: T) {
        if (this.state === READING_STATES.FLOWING) {
            this.destStreams.forEach(stream => {
                stream.write(data)
            })
        }
    }

    pipe(stream: Writable<T>) {
        if (this.state === READING_STATES.PAUSED) {
            this.construct()
            this.state = READING_STATES.FLOWING
        }

        this.destStreams.push(stream)
        return stream
    }
}

export abstract class Writable<T> {
    abstract write(data: T): void
}