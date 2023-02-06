
export class ResponseFormat {
    data: any;
    message: string;
    status: number;
    success: boolean;
    constructor(data: any, message: string, status: number, success: boolean) {
        this.data = data;
        this.message = message;
        this.status = status;
        this.success = success;
    }
}