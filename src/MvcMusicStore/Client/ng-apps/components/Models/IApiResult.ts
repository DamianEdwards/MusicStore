module MusicStore.Models {
    export interface IApiResult {
        Message?: string;
        Data?: any;
        ModelErrors?: Array<IModelError>;
    }

    export interface IModelError {
        FieldName: string;
        ErrorMessage: string;
    }
}  