export class ParsingError {
  public constructor(
    readonly position: number,
    readonly length: number,
    readonly message: string
  ) { }
}
