/// <reference path="_module.ts" />

module MusicStore.Store {
    class GenreMenuDirective implements ng.IDirective {
        public replace = true;
        public restrict = "A";
        public templateUrl = "Store/GenreMenu.html";
    }

    _module.directive("genreMenu", function () {
        return new GenreMenuDirective();
    });
}