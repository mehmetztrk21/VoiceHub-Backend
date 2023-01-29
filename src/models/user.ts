
export interface IUser {
    name: string;
    age: number;
}

export class User {
    constructor(data: IUser) {
        this.name = data.name;
        this.age = data.age;
    }
    name: string;
    age: number;
}