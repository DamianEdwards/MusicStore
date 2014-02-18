/// <reference path="GenreApi.ts" />

module MusicStore.GenreApi {
    export interface IGenreApiService {
        getGenresMenu(): ng.IPromise<Array<Models.IGenre>>;
        getGenresList(): ng.IHttpPromise<Array<Models.IGenre>>;
        getGenreAlbums(genreId: number): ng.IHttpPromise<Array<Models.IAlbum>>;
    }

    class GenreApiService implements IGenreApiService {
        private _inlineData: ng.ICacheObject;
        private _q: ng.IQService;
        private _http: ng.IHttpService;
        private _urlResolver: UrlResolver.IUrlResolverService;

        constructor($cacheFactory: ng.ICacheFactoryService,
                    $q: ng.IQService,
                    $http: ng.IHttpService,
                    urlResolver: UrlResolver.IUrlResolverService) {
            this._inlineData = $cacheFactory.get("inlineData");
            this._q = $q;
            this._http = $http;
            this._urlResolver = urlResolver;
        }

        public getGenresMenu() {
            var url = this._urlResolver.resolveUrl("~/api/genres/menu"),
                inlineData = this._inlineData ? this._inlineData.get(url) : null;

            if (inlineData) {
                return this._q.when(inlineData);
            } else {
                return this._http.get(url).then(result => result.data);
            }
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
        "$cacheFactory",
        "$q",
        "$http",
        "MusicStore.UrlResolver.IUrlResolverService",
        GenreApiService
    ]);
}