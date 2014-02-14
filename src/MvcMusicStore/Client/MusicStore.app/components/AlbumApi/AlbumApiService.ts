/// <reference path="AlbumApi.ts" />

module MusicStore.AlbumApi {
    export interface IAlbumApiService {
        getAlbumDetails(albumId: number): ng.IPromise<Models.IAlbum>;
        getMostPopularAlbums(count?: number): ng.IPromise<Array<Models.IAlbum>>;
    }

    class AlbumApiService implements IAlbumApiService {
        private _document: ng.IAugmentedJQuery;
        private _q: ng.IQService;
        private _http: ng.IHttpService;
        private _urlResolver: UrlResolver.IUrlResolverService;

        constructor($document: ng.IAugmentedJQuery, $q: ng.IQService, $http: ng.IHttpService, urlResolver: UrlResolver.IUrlResolverService) {
            this._document = $document;
            this._q = $q;
            this._http = $http;
            this._urlResolver = urlResolver;
        }

        public getAlbumDetails(albumId: number) {
            var url = this._urlResolver.resolveUrl("~/api/albums/" + albumId);
            return this._http.get(url).then(result => result.data);
        }

        public getMostPopularAlbums(count?: number) {
            var url = this._urlResolver.resolveUrl("~/api/albums/mostPopular"),
                inlineData = this._document.find("script[data-json-id='" + url + "']").text(),
                deferred: ng.IDeferred<Array<Models.IAlbum>>;

            if (inlineData) {
                deferred = this._q.defer<Array<Models.IAlbum>>();
                deferred.resolve(angular.fromJson(inlineData));
                return deferred.promise;
            } else {
                if (count && count > 0) {
                    url += "?count=" + count;
                }

                return this._http.get(url).then(result => result.data);
            }
        }
    }

    // TODO: Generate this
    _module.service("MusicStore.AlbumApi.IAlbumApiService", [
        "$document",
        "$q",
        "$http",
        "MusicStore.UrlResolver.IUrlResolverService",
        AlbumApiService
    ]);
} 