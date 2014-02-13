/// <reference path="_module.ts" />

module MusicStore.Store {
    class GenreMenuDirective implements ng.IDirective {
        public replace = true;
        public restrict = "A";
        public templateUrl;

        constructor(urlResolver: Common.IUrlResolverService) {
            this.templateUrl = urlResolver.resolveUrl("~/Store/GenreMenu.html");
        }
    }

    _module.directive("genreMenu", [
        "MusicStore.Common.IUrlResolverService",
        function (urlResolver) {
            return new GenreMenuDirective(urlResolver);
        }
    ]);
}