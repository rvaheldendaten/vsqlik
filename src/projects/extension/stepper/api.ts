export interface IStep {

    title: string;

    execute(): unknown;

    destroy(): void;
}

export abstract class Step<R> implements IStep {

    private stepTitle: string;

    public set title(title: string) {
        this.stepTitle = title;
    }

    public get title(): string {
        return this.stepTitle;
    }

    public destroy(): void {
        return;
    }

    abstract execute(): Promise<R>;
}
