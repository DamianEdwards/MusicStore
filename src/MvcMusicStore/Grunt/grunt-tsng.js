module.exports = function (grunt) {
    "use strict";

    grunt.registerMultiTask("tsng", "Generate AngularJS registration blocks based on annotations.", function () {

        // this.target is current target
        // this.data is config for current target
        // this.files is globbed files array for current target

        var overallResult = {
            modules: [],
            controllers: [],
            services: [],
            directives: [],
            filters: [],
            fileTally: 0
        };

        this.files.forEach(function (fileSet) {
            sumResult(processSet(fileSet), overallResult);
        });

        for (var key in overallResult) {
            if (key === "fileTally" || !overallResult.hasOwnProperty(key)) {
                continue;
            }

            var result = overallResult[key];

            grunt.log.writeln(result.length + " " + key + " found in " + overallResult.fileTally + " files");
        }

        //overallResult.modules.forEach(function (module) {
        //    grunt.log.writeln("   " + module.name);
        //});

        grunt.log.writeln("Directives:");
        overallResult.directives.forEach(function (directive) {
            grunt.log.writeln("   " + directive.name + " from " + directive.file);
        });

        grunt.log.writeln("Filters:");
        overallResult.filters.forEach(function (filter) {
            grunt.log.writeln("   " + filter.name + " from " + filter.file);
        });

        function sumResult(source, target) {
            if (!source || !target) {
                return;
            }

            for (var key in target) {
                if (!target.hasOwnProperty(key) || !source.hasOwnProperty(key)) {
                    continue;
                }

                var targetType = (typeof (target[key])).toLowerCase();
                var sourceType = (typeof (source[key])).toLowerCase();

                if (targetType !== sourceType) {
                    continue;
                }

                if (targetType === "number" || targetType === "string") {
                    target[key] = target[key] + source[key];
                } else if (Array.isArray(target[key])) {
                    target[key] = target[key].concat(source[key]);
                }
            }
        }

        function processSet(fileSet) {
            var result = {
                modules: [],
                controllers: [],
                services: [],
                directives: [],
                filters: [],
                fileTally: 0
            };

            fileSet.src.forEach(function (src) {
                var fileResult = processFile(src);

                //grunt.log.writeln(fileResult.modules.length + " modules found in file " + src);

                sumResult(fileResult, result);
                result.fileTally++;
            });

            return result;
        }

        function processFile(path) {
            var annotations = {
                NgModule: {
                    //@NgModule('moduleName')
                    explicit: /^\s*\/\/@NgModule(?:\(?['"]?([\w.]+)['"]?\)?\s*)?$/,
                    implicit: /^\s*(?:export\s+)?module\s*(\w.*)\s*{\s*$/,
                    process: function (explicitMatches, implicitMatches, module, fileName) {
                        var moduleName;

                        if (explicitMatches && explicitMatches[1]) {
                            // Name explicitly declared
                            moduleName = explicitMatches[1];
                        } else if (implicitMatches && implicitMatches[1]) {
                            // Get controller name from module declaration
                            moduleName = implicitMatches[1];
                        }

                        if (!moduleName) {
                            return;
                        }

                        return {
                            modules: [
                                {
                                    name: moduleName,
                                    file: fileName
                                }
                            ]
                        };
                    }
                },
                NgController: {
                    //@NgController('controllerName', exclude = true)
                    explicit: /^\s*\/\/@NgController(?:\(?['"]?(\w+)['"]?\)?\s*)?$/,
                    implicit: /^\s*(?:export\s+)?class (\w+Controller)\s*/,
                    process: function (explicitMatches, implicitMatches, module, fileName) {
                        var controllerName, fullControllerName;

                        if (explicitMatches && explicitMatches[1]) {
                            // Name explicitly declared
                            controllerName = explicitMatches[1];
                        } else if (implicitMatches && implicitMatches[1]) {
                            // Get controller name from class
                            controllerName = implicitMatches[1];
                        }

                        if (!controllerName) {
                            return;
                        }

                        fullControllerName = module + "." + controllerName;

                        return {
                            controllers: [
                                {
                                    name: fullControllerName,
                                    module: module,
                                    file: fileName
                                }
                            ]
                        };
                    }
                },
                NgService: {
                    //@NgService('serviceName')
                    explicit: /^\s*\/\/@NgService(?:\(?['"]?(\w+)['"]?\)?\s*)?$/,
                    implicit: /^\s*(?:export\s+)?class (\w+Service)\s+(?:implements\s+(\w.+)\s*{)?/,
                    process: function (explicitMatches, implicitMatches, module, fileName) {
                        var serviceName, fullServiceName, serviceFunctionName;

                        if (explicitMatches && explicitMatches[1]) {
                            // Name explicitly declared
                            serviceName = explicitMatches[1];
                        } else if (implicitMatches && implicitMatches.length === 2) {
                            // Get name from class
                            serviceName = implicitMatches[1];
                        } else if (implicitMatches && implicitMatches.length === 3) {
                            // Get name from interface
                            serviceName = implicitMatches[2];
                        }

                        if (!serviceName) {
                            return;
                        }

                        serviceFunctionName = implicitMatches[1];

                        fullServiceName = module + "." + serviceName;

                        return {
                            services: [
                                {
                                    name: fullServiceName,
                                    fnName: serviceFunctionName,
                                    module: module,
                                    file: fileName
                                }
                            ]
                        };
                    }
                },
                NgDirective: {
                    //@NgDirective('directiveName')
                    explicit: /^\s*\/\/@NgDirective(?:\(?['"]?(\w+)['"]?\)?\s*)?$/,
                    implicit: /^\s*(?:export\s+)?class (\w+Directive)\s+(?:implements\s+(\w.+)\s*{)?/,
                    process: function (explicitMatches, implicitMatches, module, fileName) {
                        var directiveName, directiveFunctionName;

                        if (explicitMatches && explicitMatches[1]) {
                            // Name explicitly declared
                            directiveName = explicitMatches[1];
                        } else if (implicitMatches && implicitMatches[1]) {
                            // Get name from class
                            directiveName = implicitMatches[1];
                        } else {
                            return;
                        }

                        directiveFunctionName = implicitMatches[1];

                        return {
                            directives: [
                                {
                                    name: directiveName,
                                    fnName: directiveFunctionName,
                                    module: module,
                                    file: fileName
                                }
                            ]
                        };
                    }
                },
                NgFilter: {
                    // //@NgFilter('filterName')
                    // function filter(input: string) {
                    explicit: /^\s*\/\/\s*@NgFilter(?:\s*\(\s*['"]?(\w+)['"]?\s*\))?\s*$/,
                    implicit: /^\s*function\s*([a-zA-Z_$]+)\s*\([a-zA-Z0-9_$:,\s]*\)/,
                    process: function (explicitMatches, implicitMatches, module, fileName) {
                        var filterName, fullfilterName, filterFunctionName;

                        if (!explicitMatches || !implicitMatches) {
                            // Must be explicitly declared and function must be found
                            return;
                        }

                        if (explicitMatches[1]) {
                            // Name explicitly declared
                            filterName = explicitMatches[1];
                        } else {
                            // Get name from function
                            filterName = implicitMatches[1];
                        }

                        if (!filterName) {
                            return;
                        }

                        filterFunctionName = implicitMatches[1];

                        fullfilterName = module + "." + filterName;

                        return {
                            filters: [
                                {
                                    name: fullfilterName,
                                    fnName: filterFunctionName,
                                    module: module,
                                    file: fileName
                                }
                            ]
                        };
                    }
                }
            };

            var result = {
                modules: [],
                controllers: [],
                services: [],
                directives: [],
                filters: []
            };
            var content = grunt.file.read(path);
            var lines = content.split("\r\n");
            var currentModule = "";

            //debugger;

            annotations: for (var key in annotations) {
                if (!annotations.hasOwnProperty(key)) {
                    continue;
                }

                var annotation = annotations[key];

                lines: for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];

                    if (key === "NgFilter") {
                        debugger;
                    }

                    var explicitMatch = line.match(annotation.explicit);
                    if (explicitMatch) {
                        // Move to next line to grab implicit match
                        i++;
                        line = lines[i];
                        if (!line) {
                            // Next line is last so move to next annotation
                            continue annotations;
                        }
                    }
                    var implicitMatch = line.match(annotation.implicit);

                    var annotationResult = annotation.process(explicitMatch, implicitMatch, currentModule, path);

                    if (annotationResult && annotationResult.modules && annotationResult.modules.length) {
                        currentModule = annotationResult.modules[annotationResult.modules.length - 1].name;
                    }

                    sumResult(annotationResult, result);
                }
            }

            return result;
        }
    });
};