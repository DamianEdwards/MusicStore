// <reference path="AlbumApi.ts" />

module MusicStore.AlbumApi {
    export interface IAlbumApiService {
        getAlbums(): ng.IPromise<Array<Models.IAlbum>>;
        getAlbumDetails(albumId: number): ng.IPromise<Models.IAlbum>;
        getMostPopularAlbums(count?: number): ng.IPromise<Array<Models.IAlbum>>;
        updateAlbum(album: Models.IAlbum): ng.IPromise<Models.IApiResult>;
    }

    class AlbumApiService implements IAlbumApiService {
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

        public getAlbums() {
            var url = this._urlResolver.resolveUrl("~/api/albums"),
                inlineData = this._inlineData ? this._inlineData.get(url) : null;

            if (inlineData) {
                return this._q.when(inlineData);
            } else {
                return this._http.get(url).then(result => result.data);
            }
        }

        public getAlbumDetails(albumId: number) {
            var url = this._urlResolver.resolveUrl("~/api/albums/" + albumId);
            return this._http.get(url).then(result => result.data);
        }

        public getMostPopularAlbums(count?: number) {
            var url = this._urlResolver.resolveUrl("~/api/albums/mostPopular"),
                inlineData = this._inlineData ? this._inlineData.get(url) : null;

            if (inlineData) {
                return this._q.when(inlineData);
            } else {
                if (count && count > 0) {
                    url += "?count=" + count;
                }

                return this._http.get(url).then(result => result.data);
            }
        }

        public updateAlbum(album: Models.IAlbum) {
            var url = this._urlResolver.resolveUrl("api/albums/" + album.AlbumId + "/update");
            return this._http.post(url, album).then(result => result.data);
        }
    }

    // TODO: Generate this
    _module.service("MusicStore.AlbumApi.IAlbumApiService", [
        "$cacheFactory",
        "$q",
        "$http",
        "MusicStore.UrlResolver.IUrlResolverService",
        AlbumApiService
    ]);
} 