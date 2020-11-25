export class BaseLocator {

    finder: RegExp = new RegExp(/base=\"([^\"]+)\"/g);
    constructor(public text: string) {
    }

    public GetMatches() {
        const results = new Array<RegExpExecArray>();
        let result = null;
        do {
            result = this.finder.exec(this.text);
            if (result)
                results.push(result);
        } while (result != null)
        return results;
    }

}