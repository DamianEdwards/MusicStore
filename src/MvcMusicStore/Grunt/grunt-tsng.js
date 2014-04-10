module.exports = function (grunt) {
    "use strict";

    var path = require('path');

    grunt.registerMultiTask("tsng", "Generate AngularJS registration blocks based on conventions and annotations in TypeScript files.", function () {

        // this.target is current target
        // this.data is config for current target
        // this.files is globbed files array for current target

        var options = this.options({
            extension: ".ng.ts",
            cwd: "."
        });

        options.cwd = path.resolve(options.cwd);

        grunt.log.writeln("Extension path: " + options.extension);

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
            var setResult = processSet(fileSet, options);

            if (setResult.error) {
                error = setResult.error;
                return false;
            }

            logResult(setResult, idx + 1);
            sumResult(setResult, overallResult);
        });

        if (error) {
            grunt.log.error(error);
            return;
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

        function logResult(result, setId) {
            grunt.log.writeln("------------------------------------------");
            grunt.log.writeln("File Set #" + setId);
            grunt.log.writeln("------------------------------------------");

            grunt.log.writeln("Modules:");
            result.modules.forEach(function (module) {
                grunt.log.writeln("   " + module.name + (module.file ? " defined in " + module.file + " with " + (module.dependencies ? module.dependencies.length : 0) + " dependencies" : " has no file"));
            });

            grunt.log.writeln("Controllers:");
            result.controllers.forEach(function (controller) {
                grunt.log.writeln("   " + controller.name + " using fn " + controller.fnName + " with " + controller.dependencies.length + " dependencies from " + controller.file);
            });

            grunt.log.writeln("Services:");
            result.services.forEach(function (service) {
                grunt.log.writeln("   " + service.name + " using fn " + service.fnName + " with " + service.dependencies.length + " dependencies from " + service.file);
            });

            grunt.log.writeln("Directives:");
            result.directives.forEach(function (directive) {
                grunt.log.writeln("   " + directive.name + " using fn " + directive.fnName + " with " + directive.dependencies.length + " dependencies from " + directive.file);
            });

            grunt.log.writeln("Filters:");
            result.filters.forEach(function (filter) {
                grunt.log.writeln("   " + filter.name + " using fn " + filter.fnName + " from " + filter.file);
            });

            for (var key in result) {
                if (key === "fileTally" || !result.hasOwnProperty(key)) {
                    continue;
                }

                var items = result[key];
                grunt.log.writeln(items.length + " " + key + " found in " + result.fileTally + " files");
            }
        }

        function processSet(fileSet, options) {
            var result = {
                modules: [],
                controllers: [],
                services: [],
                directives: [],
                filters: [],
                fileTally: 0
            };
            var modules = {};
            var files = {};
            var error;

            fileSet.src.forEach(function (path) {
                var fileResult = processFile(path, options);
                fileResult.path = path;

                if (fileResult.error) {
                    error = fileResult.error;
                    return false;
                }

                mergeModules(fileResult, modules);
                files[path] = fileResult;

                sumResult(fileResult, result);
                result.fileTally++;
            });

            if (error) {
                return { error: error };
            }

            // Emit module files
            for (var name in modules) {
                if (!modules.hasOwnProperty(name)) {
                    continue;
                }
                
                emitModuleFile(modules[name], options);

                if (!modules[name].file) {
                    throw new Error("Module " + name + " doesn't have a file");
                }
            }

            // Emit non-module files
            for (var path in files) {
                if (!files.hasOwnProperty(path)) {
                    continue;
                }

                emitFile(files[path], result.services, options);
            }

            return result;
        }

        function resolveTypeName(name, moduleName, allNames) {
            /// <param name="name" type="String" />
            /// <param name="moduleName" type="String" />
            /// <param name="allNames" type="Array" elementType="String" />

            debugger;

            var prefix, matchedIndex;
            var parts = moduleName.split(".");

            if (parts.length === 1) {
                matchedIndex = allNames.indexOf(moduleName);
                if (matchedIndex >= 0) {
                    return allNames[matchedIndex];
                }
                // No match found!
                return null;
            }

            for (var i = parts.length - 1; i >= 0; i--) {
                prefix = "";
                parts.forEach(function (part, index) {
                    if (index <= i) {
                        prefix += part + ".";
                    }
                });

                matchedIndex = allNames.indexOf(prefix + name)
                if (matchedIndex >= 0) {
                    return allNames[matchedIndex];
                }
            }

            // No match found!
            return null;
        }

        function emitModuleFile(module, options) {
            var filepath = "";
            var content = "";
            var srcLines;

            if (module.file) {
                // Module already has a file defined, just add the module registration
                filepath = module.file.substr(0, module.file.length - 3) + options.extension;
                srcLines = grunt.file.read(module.file).split("\r\n");

                //grunt.log.writeln("module.declarationLine=" + module.declarationLine);

                srcLines.forEach(function (line, i) {
                    if (i === (module.declarationLine + 1)) {

                        // Add the module registration
                        content += "    angular.module(\"" + module.name + "\", [\r\n";

                        if (module.dependencies && module.dependencies.length) {
                            module.dependencies.forEach(function (d) {
                                content += "        \"" + d + "\",\r\n";
                            });
                        }

                        content += "    ])";

                        ["config", "run"].forEach(function (method) {
                            var fn = module[method + "Fn"];
                            if (fn) {
                                content += "." + method + "([\r\n";
                                fn.dependencies.forEach(function (d) {
                                    var name = d.name.substr(0, 1) === "$" ? d.name : d.type;
                                    content += "        \"" + name + "\",\r\n";
                                });
                                content += "        " + fn.fnName + "\r\n    ])";
                            }
                        });

                        content += ";\r\n\r\n";
                    }

                    content += line + "\r\n";
                });
            } else {
                // We need to render a whole file
                filepath = path.join(options.cwd, module.name + options.extension);
                content = "module " + module.name + " {\r\n";
                content += "    angular.module(\"" + module.name + "\", []);\r\n";
                content += "}";
            }

            grunt.file.write(filepath, content);
            module.file = filepath;
        }

        function emitFile(file, services, options) {
            var filepath;
            var srcLines;
            var content = "";
            var module = file.modules[0];
            var serviceNames = services.map(function (service) {
                return service.name;
            });

            filepath = file.path.substr(0, file.path.length - 3) + options.extension;
            srcLines = grunt.file.read(file.path).split("\r\n");

            srcLines.forEach(function (line, i) {
                if (i === 0) {
                    // Add reference to module file
                    // e.g. /// <reference path="../../MyModule.ng.ts" />

                    if (!module.file) {
                        throw new Error("Module " + module.name + " doesn't have a file?");
                    }

                    content += "/// <reference path=\"" + module.file + "\" />\r\n\r\n";
                }

                if (i === (module.declarationLine + 1)) {

                    content += "    angular.module(\"" + module.name + "\")\r\n";

                    // Register controllers
                    file.controllers.forEach(function (controller) {
                        content += "       .controller(\"" + controller.name + "\", [\r\n";

                        if (controller.dependencies && controller.dependencies.length) {
                            controller.dependencies.forEach(function (d) {
                                var typeName;
                                if (d.name.substr(0, 1) === "$") {
                                    typeName = d.name;
                                } else {
                                    typeName = resolveTypeName(d.type, module.name, serviceNames);
                                    if (!typeName) {
                                        // Couldn't resolve type name
                                        throw new Error("Error: Can't resolve dependency for controller " + controller.name + " with name " + d.type);
                                    }
                                }
                                content += "            \"" + typeName + "\",\r\n";
                            });
                        }

                        content += "            " + controller.fnName + "\r\n";
                        content += "    ])\r\n";
                    });

                    // Register services
                    file.services.forEach(function (service) {
                        content += "       .service(\"" + service.name + "\", [\r\n";

                        if (service.dependencies && service.dependencies.length) {
                            service.dependencies.forEach(function (d) {
                                content += "            \"" + d.type + "\",\r\n";
                            });
                        }

                        content += "        " + service.fnName + "\r\n";
                        content += "    ])\r\n";
                    });

                    // Register directives
                    file.directives.forEach(function (directive) {
                        content += "       .directive(\"" + directive.name + "\", [\r\n";

                        if (directive.dependencies && directive.dependencies.length) {
                            directive.dependencies.forEach(function (d) {
                                content += "            \"" + d.type + "\",\r\n";
                            });
                        }

                        var alphabet = "abcdefghijklmnopqrstuvwxyz";
                        alphabet += alphabet.toUpperCase();

                        var argList = directive.dependencies.map(function (d, index) {
                            return alphabet.substr(index, 1);
                        });

                        content += "        function (";
                        content += argList;
                        content += ") {\r\n";
                        content += "            return new " + directive.fnName + "(" + argList + ");";
                        content += "        }\r\n";
                        content += "    ])\r\n";
                    });

                    // Register filters
                    file.directives.forEach(function (filter) {
                        content += "       .filter(\"" + filter.name + "\", () => " + filter.fnName + ")\r\n";
                    });

                    content += ";\r\n\r\n";
                }

                content += line + "\r\n";

                grunt.file.write(filepath, content);
            });
        }

        function processFile(filepath, options) {
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
                controllerComment: /^\s*\/\/@NgController(?:\(?['"]?([\w]*|skip\=true)['"]?\)?\s*)?$/,
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
                constructor: /constructor\s*\(\s*([^(]*)\s*\)\s*{/
            };
            var content = grunt.file.read(filepath);
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
                            error = "Error: " + filepath + "(" + i + "): Only one module can be declared per file";
                            break;
                        }

                        var moduleFile = parseModuleFile(filepath);
                        moduleFile.name = matches[1];
                        moduleFile.declarationLine = i;
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
                                        file: filepath
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
                                        file: filepath
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
                        //debugger;
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
                            error = "Error: " + filepath + "(" + i + "): Only one module can be declared per file";
                            break;
                        }

                        var moduleFile = parseModuleFile(filepath);
                        moduleFile.name = state[1] || matches[1];
                        module = moduleFile;

                        state = null;
                        expecting = expect.anything;
                    } else {
                        // A module comment was found but the next line wasn't a module declaration
                        error = "Error: " + filepath + "(" + i + "): @NgModule must be followed by a TypeScript module declaration, e.g. module My.Module.Name {";
                        break;
                    }
                }

                if (expecting === expect.controllerDeclaration) {
                    if (state[1] === "skip=true") {
                        state = null;
                        expecting = expect.anything;
                        continue;
                    }
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
                                    file: filepath
                                });
                            };
                        }());
                        expecting = expect.constructor;
                        continue;
                    } else {
                        // A controller comment was found but the next line wasn't a controller declaration
                        error = "Error: " + filepath + "(" + i + "): @NgController must be followed by a TypeScript class declaration ending with 'Controller', e.g. class MyController implements IMyViewModel {";
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
                                        file: filepath
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
                                        file: filepath
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
                            file: filepath
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
                                var a = { name: argParts[0].trim() };
                                if (argParts.length > 1) {
                                    a.type = argParts[1].trim();
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
                    error = "Error: End of file " + filepath + " reached while expecting " + expecting;
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

        function parseModuleFile(filepath) {
            var regex = {
                dependencies: /var\s+dependencies\s*=\s*\[([\w\s.,"']*)\]/,
                configFn: /function\s*(configuration)\s*\(\s*([\w$:.,\s]*)\s*\)\s*{/,
                runFn: /function\s*(run)\s*\(\s*([\w$:.,\s]*)\s*\)\s*{/
            };
            var matches = {};
            var result = {};
            var content = grunt.file.read(filepath);

            for (var key in regex) {
                if (!regex.hasOwnProperty(key)) {
                    continue;
                }

                matches[key] = content.match(regex[key]);
                if (matches[key]) {
                    result.file = filepath;
                }
            }

            if (!result.file) {
                return result;
            }

            if (matches["dependencies"]) {
                var arrayMembers = matches["dependencies"][1];
                var dependencies = [];
                if (arrayMembers) {
                    arrayMembers.split(",").forEach(function (dependency) {
                        dependency = trim(dependency.trim(), ["\"", "'"]);
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
                                name: parts[0].trim()
                            };

                            if (parts[1]) {
                                dependency.type = parts[1].trim();
                            }

                            dependencies.push(dependency);
                        });
                    }
                    result[fn] = {
                        fnName: matches[fn][1],
                        dependencies: dependencies
                    };
                }
            });

            return result;
        }

        function mergeModules(result, modules) {
            if (!result.modules) {
                return;
            }

            result.modules.forEach(function (module) {
                if (modules[module.name]) {
                    // Existing module
                    if (modules[module.name].file && module.file) {
                        // Error: Module defined in multiple files
                        throw new Error("tsng: Module '" + module.name + "' defined in multiple files");
                    }
                    if (module.file) {
                        modules[module.name].file = module.file;
                    }
                } else {
                    modules[module.name] = module;
                }
            });
        }

        function trim(target, chars) {
            /// <param name="target" type="String" />
            /// <param name="chars" type="Array" />

            //debugger;

            chars = chars || [" "];

            if (!target) {
                return target;
            }

            var result = "";

            // Trim from start
            for (var i = 0; i < target.length; i++) {
                var c = target[i];
                if (chars.indexOf(c) < 0) {
                    result = target.substr(i);
                    break;
                }
            }

            // Trim from end
            for (var i = result.length - 1; i >= 0; i--) {
                var c = result[i];
                if (chars.indexOf(c) < 0) {
                    result = result.substring(0, i + 1);
                    break;
                }
            }

            return result;
        }
    });
};