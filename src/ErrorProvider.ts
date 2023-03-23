export class ErrorProvider {
    public static async catch(err: any) {
        if((err instanceof Error) === false) {
            err = new Error(err);
        }
        console.error(err);
    }
    public static throw(callback?) : any {
        return (err) => {
            if (callback) callback(err);
            ErrorProvider.catch(err);
        }
    }
}