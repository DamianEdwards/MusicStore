module.exports = function (grunt) {
    "use strict";

    grunt.registerMultiTask("tsng", "Generate AngularJS registration blocks based on annotations.", function () {

        // this.target is current target
        // this.data is config for current target
        // this.files is globbed files array for current target

        var annotations = {
            NgModule: {
                //@NgModule('moduleName')
                explicit: /^\s*\/\/@NgModule(?:\(?['"]?([\w.]+)['"]?\)?\s*)?$/,
                implicit: /^\s*(?:export\s+)?module\s*(\S*)\s*{\s*$/,
                process: function (explicitMatches, implicitMatches, fileName) {
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
                process: function (explicitMatches, implicitMatches, fileName) {
                    //var controllerName, fullControllerName;

                    //if (explicitMatches && explicitMatches[1]) {
                    //    // Name explicitly declared
                    //    controllerName = explicitMatches[1];
                    //} else {
                    //    // Get controller name from class
                    //    controllerName = implicitMatches[1];
                    //}

                    //fullControllerName = module + "." + controllerName;


                }
            },
            NgService: {
                //@NgService('serviceName')
                regex: /^\s*\/\/@NgService(?:\(?['"]?(\w+)['"]?\)?\s*)?$/,
                process: function (explicitMatches, implicitMatches, fileName) {

                }
            },
            NgDirective: {
                //@NgDirective('directiveName')
                regex: /^\s*\/\/@NgDirective(?:\(?['"]?(\w+)['"]?\)?\s*)?$/,
                process: function (explicitMatches, implicitMatches, fileName) {

                }
            },
            NgFilter: {
                //@NgFilter('filterName')
                explicit: /^\s*\/\/@NgFilter(?:\(?['"]?(\w+)['"]?\)?\s*)?$/,
                process: function (explicitMatches, implicitMatches, fileName) {

                }
            }
        };

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

                grunt.log.writeln(fileResult.modules.length + " modules found in file " + src);

                sumResult(fileResult, result);
                result.fileTally++;
            });

            return result;
        }

        function processFile(path) {
            var result = {
                modules: [],
                controllers: [],
                services: [],
                directives: [],
                filters: []
            };
            var content = grunt.file.read(path);
            var lines = content.split("\n");
            //var moduleLineRegex = /^module\s*(\S*)\s*{\s*$/;
            var currentModule = "";
            
            debugger;

            annotations: for (var key in annotations) {
                if (!annotations.hasOwnProperty(key)) {
                    continue;
                }

                var annotation = annotations[key];

                lines: for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];

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

                    var annotationResult = annotation.process(explicitMatch, implicitMatch, path);

                    if (annotationResult && annotationResult.modules && annotationResult.modules.length) {
                        currentModule = annotationResult.modules[annotationResult.modules.length - 1].name;
                    }

                    sumResult(annotationResult, result);
                }

                //var matches = line.match(moduleLineRegex);

                //if (matches && matches.length === 2) {
                //    currentModule = matches[1];

                //    result.modules.push({
                //        name: currentModule,
                //        file: path
                //    });
                //}
            }

            return result;
        }

        grunt.log.writeln(overallResult.modules.length + " modules found in " + overallResult.fileTally + " files");
        overallResult.modules.forEach(function (module) {
            grunt.log.writeln("   " + module.name);
        });
    });
};