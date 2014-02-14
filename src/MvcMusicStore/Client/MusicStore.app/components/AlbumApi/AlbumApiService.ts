/// <reference path="AlbumApi.ts" />

module MusicStore.AlbumApi {
    export interface IAlbumApiService {
        getAlbumDetails(albumId: number): ng.IHttpPromise<Models.IAlbum>;
        getMostPopularAlbums(count?: number): ng.IHttpPromise<Array<Models.IAlbum>>;
    }

    class AlbumApiService implements IAlbumApiService {
        private _http: ng.IHttpService;
        private _urlResolver: UrlResolver.IUrlResolverService;

        constructor($http: ng.IHttpService, urlResolver: UrlResolver.IUrlResolverService) {
            this._http = $http;
            this._urlResolver = urlResolver;
        }

        public getAlbumDetails(albumId: number) {
            var url = this._urlResolver.resolveUrl("~/api/albums/" + albumId);
            return this._http.get(url);
        }

        public getMostPopularAlbums(count?: number) {
            var url = this._urlResolver.resolveUrl("~/api/albums/mostPopular");
            if (count && count > 0) {
                url += "?count=" + count;
            }
            return this._http.get(url);
        }
    }

    // TODO: Generate this
    _module.service("MusicStore.AlbumApi.IAlbumApiService", [
        "$http",
        "MusicStore.UrlResolver.IUrlResolverService",
        AlbumApiService
    ]);
} 