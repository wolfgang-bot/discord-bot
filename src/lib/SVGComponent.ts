export default abstract class SVGComponent {
    children: {
        [label: string]: SVGComponent
    }

    abstract getWidth(): number
    abstract getHeight(): number
    abstract toString(): string
}