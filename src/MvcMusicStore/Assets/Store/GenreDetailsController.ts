/// <reference path="_module.ts" />

module MusicStore.Store {
    class GenreDetailsController implements IGenreDetailsViewModel {
        public albums: Array<Models.IAlbum>;

        constructor($http: ng.IHttpService, $routeParams: IGenreDetailsRouteParams) {
            var viewModel = this;

            $http.get("/api/genres/" + $routeParams.genreId + "/albums").success(result => {
                viewModel.albums = result;
            });
        }
    }

    // TODO: Generate this!
    _module.controller("MusicStore.Store.GenreDetailsController", [
        "$http",
        "$routeParams",
        GenreDetailsController]);
}