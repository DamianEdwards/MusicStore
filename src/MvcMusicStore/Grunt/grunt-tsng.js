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
        var error;
        
        this.files.forEach(function (fileSet, idx) {
            var setResult = processSet(fileSet);

            if (setResult.error) {
                error = setResult.error;
                return false;
            }

            grunt.log.writeln("------------------------------------------");
            grunt.log.writeln("File Set #" + (idx + 1));
            grunt.log.writeln("------------------------------------------");

            grunt.log.writeln("Modules:");
            setResult.modules.forEach(function (module) {
                grunt.log.writeln("   " + module.name + (module.isModuleFile ? " defined in " + module.file + " with " + module.dependencies.length + " dependencies" : " has no file"));
            });

            grunt.log.writeln("Controllers:");
            setResult.controllers.forEach(function (controller) {
                grunt.log.writeln("   " + controller.name + " using fn " + controller.fnName + " with " + controller.dependencies.length + " dependencies from " + controller.file);
            });

            grunt.log.writeln("Services:");
            setResult.services.forEach(function (service) {
                grunt.log.writeln("   " + service.name + " using fn " + service.fnName + " with " + service.dependencies.length + " dependencies from " + service.file);
            });

            grunt.log.writeln("Directives:");
            setResult.directives.forEach(function (directive) {
                grunt.log.writeln("   " + directive.name + " using fn " + directive.fnName + " with " + directive.dependencies.length + " dependencies from " + directive.file);
            });

            grunt.log.writeln("Filters:");
            setResult.filters.forEach(function (filter) {
                grunt.log.writeln("   " + filter.name + " using fn " + filter.fnName + " from " + filter.file);
            });

            sumResult(setResult, overallResult);
        });

        if (error) {
            grunt.log.error(error);
            return;
        }

        for (var key in overallResult) {
            if (key === "fileTally" || !overallResult.hasOwnProperty(key)) {
                continue;
            }

            var result = overallResult[key];

            grunt.log.writeln(result.length + " " + key + " found in " + overallResult.fileTally + " files");
        }

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
            var error;

            fileSet.src.forEach(function (src) {
                var fileResult = processFile(src);

                //grunt.log.writeln(fileResult.modules.length + " modules found in file " + src);

                if (fileResult.error) {
                    error = fileResult.error;
                    return false;
                }

                sumResult(fileResult, result);
                result.fileTally++;
            });

            if (error) {
                return { error: error };
            }

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
            var regex = {
                // //@NgModule('moduleName')
                // module My.Great.Module {
                moduleComment: /^\s*\/\/@NgModule(?:\(?['"]?([\w.]+)['"]?\)?\s*)?$/,
                moduleDeclaration: /^\s*(?:export\s+)?module\s*([\w.]*)\s*{\s*$/,

                // //@NgController('controllerName')
                // class MyController implements IMyViewModel {
                controllerComment: /^\s*\/\/@NgController(?:\(?['"]?(\w+)['"]?\)?\s*)?$/,
                controllerDeclaration: /^\s*(?:export\s+)?class (\w+Controller)\s*/,

                // //@NgService('serviceName')
                // class MyService implements IMyService {
                serviceComment: /^\s*\/\/@NgService(?:\(?['"]?(\w+)['"]?\)?\s*)?$/,
                serviceDeclaration: /^\s*(?:export\s+)?class (\w+Service)\s+(?:implements\s+([\w.]+)\s*{)?/,

                // //@NgDirective('directiveName')
                // class MyDirective implements ng.IDirective {
                directiveComment: /^\s*\/\/@NgDirective(?:\(?['"]?(\w+)['"]?\)?\s*)?$/,
                directiveDeclaration: /^\s*(?:export\s+)?class (\w+Directive)\s+(?:implements\s+(\w.+)\s*{)?/,

                // //@NgFilter('filterName')
                // function filter(input: string) {
                filterComment: /^\s*\/\/\s*@NgFilter(?:\s*\(\s*['"]?(\w+)['"]?\s*\))?\s*$/,
                filterDeclaration: /^\s*function\s*([a-zA-Z_$]+)\s*\([a-zA-Z0-9_$:,\s]*\)/,

                // constructor($window: ng.IWindowService) {
                constructor: /constructor\s*\(([^{]*\)?)\s*{/
            };
            var content = grunt.file.read(path);
            var lines = content.split("\r\n");
            var module, line, matches, state, error;
            var expect = {
                anything: 0,
                moduleDeclaration: 1,
                controllerDeclaration: 2,
                serviceDeclaration: 4,
                directiveComment: 8,
                directiveDeclaration: 16,
                filterDeclaration: 32,
                constructor: 64
            };
            var expecting = expect.anything;

            //debugger;

            for (var i = 0; i < lines.length; i++) {
                line = lines[i];

                if (expecting === expect.anything) {
                    // Check for module comment
                    matches = line.match(regex.moduleComment);
                    if (matches) {
                        expecting = expect.moduleDeclaration;
                        state = matches;
                        continue;
                    }

                    // Check for module declaration
                    matches = line.match(regex.moduleDeclaration);
                    if (matches) {
                        if (module) {
                            // A module is already declared for this file
                            error = "Error: " + path + "(" + i + "): Only one module can be declared per file";
                            break;
                        }

                        var moduleFile = parseModuleFile(path);
                        moduleFile.name = matches[1];
                        module = moduleFile;

                        state = null;
                    }

                    // Check for controller comment
                    matches = line.match(regex.controllerComment);
                    if (matches) {
                        expecting = expect.controllerDeclaration;
                        state = matches;
                        continue;
                    }

                    // Check for controller declaration
                    matches = line.match(regex.controllerDeclaration);
                    if (matches) {
                        (function () {
                            var fnName = matches[1];
                            var name = (module ? module.name + "." : "") + fnName;
                            state = {
                                push: function (d, s) {
                                    result.controllers.push({
                                        module: module,
                                        name: name,
                                        fnName: fnName,
                                        dependencies: d,
                                        file: path
                                    });
                                }
                            };
                        }());
                        expecting = expect.constructor;
                        continue;
                    }

                    // Check for service comment
                    matches = line.match(regex.serviceComment);
                    if (matches) {
                        expecting = expect.serviceDeclaration;
                        state = matches;
                        continue;
                    }

                    // Check for service declaration
                    matches = line.match(regex.serviceDeclaration);
                    if (matches) {
                        (function () {
                            var className = matches[1];
                            var interfaceName = matches[2];
                            var name = (module ? module.name + "." : "") + (interfaceName || className);
                            state = {
                                push: function (d, s) {
                                    result.services.push({
                                        module: module,
                                        name: name,
                                        fnName: className,
                                        dependencies: d,
                                        file: path
                                    });
                                }
                            };
                        }());
                        expecting = expect.constructor;
                        continue;
                    }
                    
                    // Check for directive comment
                    matches = line.match(regex.directiveComment);
                    if (matches) {
                        debugger;
                        expecting = expect.directiveComment | expect.directiveDeclaration;
                        state = { names: [] };
                        state.names.push(matches[1]);
                        continue;
                    }

                    // Check for filter comment
                    matches = line.match(regex.filterComment);
                    if (matches) {
                        expecting = expect.filterDeclaration;
                        state = matches;
                        continue;
                    }
                }

                if (expecting === expect.moduleDeclaration) {
                    // Check for module declaration
                    matches = line.match(regex.moduleDeclaration);
                    if (matches) {
                        if (module) {
                            // A module is already declared for this file
                            error = "Error: " + path + "(" + i + "): Only one module can be declared per file";
                            break;
                        }

                        var moduleFile = parseModuleFile(path);
                        moduleFile.name = state[1] || matches[1];
                        module = moduleFile;

                        state = null;
                        expecting = expect.anything;
                    } else {
                        // A module comment was found but the next line wasn't a module declaration
                        error = "Error: " + path + "(" + i + "): @NgModule must be followed by a TypeScript module declaration, e.g. module My.Module.Name {";
                        break;
                    }
                }

                if (expecting === expect.controllerDeclaration) {
                    // Check for controller declaration
                    matches = line.match(regex.controllerDeclaration);
                    if (matches) {
                        (function () {
                            var name = (module ? module.name + "." : "") + (state[1] || matches[1]);
                            state.push = function (d, s) {
                                result.controllers.push({
                                    module: module,
                                    name: name,
                                    fnName: matches[1],
                                    dependencies: d,
                                    file: path
                                });
                            };
                        }());
                        expecting = expect.constructor;
                        continue;
                    } else {
                        // A controller comment was found but the next line wasn't a controller declaration
                        error = "Error: " + path + "(" + i + "): @NgController must be followed by a TypeScript class declaration ending with 'Controller', e.g. class MyController implements IMyViewModel {";
                        break;
                    }
                }

                if (expecting === expect.serviceDeclaration) {
                    // Check for service declaration
                    matches = line.match(regex.serviceDeclaration);
                    if (matches) {
                        (function () {
                            var className = matches[1];
                            var interfaceName = matches[2];
                            var name = (module ? module.name + "." : "") + ((state ? state[1] : null) || interfaceName || className);
                            state = {
                                push: function (d, s) {
                                    result.services.push({
                                        module: module,
                                        name: name,
                                        fnName: className,
                                        dependencies: d,
                                        file: path
                                    });
                                }
                            };
                        }());
                        expecting = expect.constructor;
                        continue;
                    }
                }

                if (expecting & expect.directiveComment) {
                    // Check for directive comment
                    matches = line.match(regex.directiveComment);
                    if (matches) {
                        expecting = expect.directiveComment | expect.directiveDeclaration;
                        state.names.push(matches[1]);
                        continue;
                    }
                }

                if (expecting & expect.directiveDeclaration) {
                    // Check for directive function
                    matches = line.match(regex.directiveDeclaration);
                    if (matches) {
                        (function () {
                            var fnName = matches[1];
                            state.push = function (d, s) {
                                s.names.forEach(function (name) {
                                    result.directives.push({
                                        module: module,
                                        name: name,
                                        fnName: fnName,
                                        dependencies: d,
                                        file: path
                                    });
                                });
                            };
                        }());
                        expecting = expect.constructor;
                        continue;
                    }
                }

                if (expecting === expect.filterDeclaration) {
                    // Check for filter function
                    matches = line.match(regex.filterDeclaration);
                    if (matches) {
                        result.filters.push({
                            module: module,
                            name: state[1] || matches[1],
                            fnName: matches[1],
                            file: path
                        });
                        state = null;
                        expecting = expect.anything;
                        continue;
                    }
                }

                if (expecting === expect.constructor) {
                    // Check for the constructor function
                    matches = line.match(regex.constructor);
                    if (matches) {
                        var args = [];
                        if (matches[1]) {
                            matches[1].split(",").forEach(function (arg) {
                                var argParts = arg.split(":");
                                var a = { name: argParts[0] };
                                if (argParts.length > 1) {
                                    a.type = argParts[1];
                                }
                                args.push(a);
                            });
                        }
                        state.push(args, state);
                        state = null;
                        expecting = expect.anything;
                        continue;
                    }
                }
            }

            if (expecting !== expect.anything) {
                if (expecting === expect.constructor) {
                    // No constructor found so just push with zero dependencies
                    state.push([], state);
                } else {
                    error = "Error: End of file " + path + " reached while expecting " + expecting;
                }
            }

            if (error) {
                return {
                    error: error
                };
            }

            result.modules.push(module);

            return result;
        }

        function parseModuleFile(path) {
            var regex = {
                dependencies: /var\s+dependencies\s*=\s*\[([\w\s.,"']*)\]/,
                configFn: /function\s*(configuration)\s*\(\s*([\w$:.,\s]*)\s*\)\s*{/,
                runFn: /function\s*(run)\s*\(\s*([\w$:.,\s]*)\s*\)\s*{/
            };
            var matches = {};
            var result = {
                isModuleFile: false,
                file: path
            };
            var content = grunt.file.read(path);

            for (var key in regex) {
                if (!regex.hasOwnProperty(key)) {
                    continue;
                }

                matches[key] = content.match(regex[key]);
                if (matches[key]) {
                    result.isModuleFile = true;
                }
            }

            if (!result.isModuleFile) {
                return result;
            }

            if (matches["dependencies"]) {
                var arrayMembers = matches["dependencies"][1];
                var dependencies = [];
                if (arrayMembers) {
                    arrayMembers.split(",").forEach(function (dependency) {
                        if (dependency.substr(0, 1) === "\"" && dependency.substr(dependency.length - 1) === "\"") {
                            // Trim leading & trailing quotes
                            dependency = dependency.substr(1, dependency.length - 2);
                        } else if (dependency.substr(0, 1) === "\'" && dependency.substr(dependency.length - 1) === "\'") {
                            // Trim leading & trailing quotes
                            dependency = dependency.substr(1, dependency.length - 2);
                        }
                        dependencies.push(dependency);
                    });
                }
                result.dependencies = dependencies;
            }

            ["configFn", "runFn"].forEach(function (fn) {
                if (matches[fn]) {
                    var args = matches[fn][2];
                    var dependencies = [];
                    if (args) {
                        args.split(",").forEach(function (arg) {
                            var parts = arg.split(":");
                            var dependency = {
                                name: parts[0]
                            };

                            if (parts[1]) {
                                dependency.type = parts[1];
                            }

                            dependencies.push(dependency);
                        });
                    }
                    result.configFn = {
                        fnName: matches[fn][1],
                        dependencies: dependencies
                    };
                }
            });

            return result;
        }
    });
};