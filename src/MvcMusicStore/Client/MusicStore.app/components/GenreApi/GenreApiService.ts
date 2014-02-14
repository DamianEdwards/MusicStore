/// <reference path="GenreApi.ts" />

module MusicStore.GenreApi {
    export interface IGenreApiService {
        getGenresMenu(): ng.IHttpPromise<Array<Models.IGenre>>;
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
    }

    // TODO: Generate this
    _module.service("MusicStore.GenreApi.IGenreApiService", [
        "$http",
        "MusicStore.UrlResolver.IUrlResolverService",
        GenreApiService
    ]);
}