/// <reference path="Home.ts" />

module MusicStore.Home {
    class HomeController implements IHomeViewModel {
        public albums: Array<Models.IAlbum>;

        constructor($http: ng.IHttpService, urlResolver: UrlResolver.IUrlResolverService) {
            var viewModel = this,
                url = urlResolver.resolveUrl("~/api/albums/mostPopular");

            $http.get(url).success(result => {
                viewModel.albums = result;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Home.HomeController", [
        "$http",
        "MusicStore.UrlResolver.IUrlResolverService",
        HomeController]);
} 