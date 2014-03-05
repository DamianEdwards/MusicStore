/// <reference path="InlineData.ts" />

module MusicStore.InlineData {
    interface InlineDataAttributes extends ng.IAttributes {
        type: string;
        for: string;
    }

    class InlineDataDirective implements ng.IDirective {
        private _cache: ng.ICacheObject;
        private _log: ng.ILogService;

        constructor($cacheFactory: ng.ICacheFactoryService, $log: ng.ILogService) {
            this._cache = $cacheFactory.get("inlineData") || $cacheFactory("inlineData");
            this._log = $log;

            this.link = this.link.bind(this);
        }

        public restrict = "A";

        public link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: InlineDataAttributes) {
            var data = attrs.type === "application/json"
                ? angular.fromJson(element.text())
                : element.text();

            this._log.info("appInlineData: Inline data element found for " + attrs.for);

            this._cache.put(attrs.for, data);

            //element.remove();
        }
    }

    // TODO: Generate this
    _module.directive("appInlineData", [
        "$cacheFactory",
        "$log",
        function ($cacheFactory, $log) {
            return new InlineDataDirective($cacheFactory, $log);
        }
    ]);
} 