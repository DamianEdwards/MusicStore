module MusicStore.UserDetails {
    export interface IUserDetails {
        isAuthenticated: boolean;
        userName: string;
        userId: string;
        roles: Array<string>;
    }
} 