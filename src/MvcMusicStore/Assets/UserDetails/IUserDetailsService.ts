module MusicStore.UserDetails {
    export interface IUserDetailsService {
        getUserDetails(elementId: string): IUserDetails;
    }
} 