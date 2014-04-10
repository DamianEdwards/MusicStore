module MusicStore.GenreMenu {

    //@NgDirective('appGenreMenu')
    class GenreMenuDirective implements ng.IDirective {
        public replace = true;
        public restrict = "A";
        public templateUrl;

        constructor(urlResolver: UrlResolver.IUrlResolverService) {
            this.templateUrl = urlResolver.resolveUrl("~/ng-apps/components/GenreMenu/GenreMenu.html");
        }
    }

    //angular.module("MusicStore.GenreMenu")
    //    .directive("appGenreMenu", [
    //        "MusicStore.UrlResolver.IUrlResolverService",
    //        function (urlResolver) {
    //            return new GenreMenuDirective(urlResolver);
    //        }
    //    ]);
}