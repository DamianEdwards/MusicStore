/// <reference path="GenreApi.ts" />

module MusicStore.GenreApi {
    export interface IGenreApiService {
        getGenresMenu(): ng.IHttpPromise<Array<Models.IGenre>>;
        getGenresList(): ng.IHttpPromise<Array<Models.IGenre>>;
        getGenreAlbums(genreId: number): ng.IHttpPromise<Array<Models.IAlbum>>;
    }

    class GenreApiService implements IGenreApiService {
        private _http: ng.IHttpService;
        private _urlResolver: UrlResolver.IUrlResolverService;

        constructor($http: ng.IHttpService, urlResolver: UrlResolver.IUrlResolverService) {
            this._http = $http;
            this._urlResolver = urlResolver;
        }

        public getGenresMenu() {
            var url = this._urlResolver.resolveUrl("~/api/genres/menu");
            return this._http.get(url);
        }

        public getGenresList() {
            var url = this._urlResolver.resolveUrl("~/api/genres");
            return this._http.get(url);
        }

        public getGenreAlbums(genreId: number) {
            var url = this._urlResolver.resolveUrl("~/api/genres/" + genreId + "/albums");
            return this._http.get(url);
        }
    }

    // TODO: Generate this
    _module.service("MusicStore.GenreApi.IGenreApiService", [
        "$http",
        "MusicStore.UrlResolver.IUrlResolverService",
        GenreApiService
    ]);
}