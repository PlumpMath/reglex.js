/*

    Copyright (c) 2010 Colin Teal

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

*/

(function (callback) {
    var RegLex = {};

    function $g(definition) { return new RegLex.Grammar(definition); }

    function $lex(str, $grammar) { return RegLex.Lexer.analyze(str, $grammar); }

    RegLex.Token = function (options) {
        this.name = function () {
            return options.name;
        };
        this.expression = function () {
            return options.expression;
        };
    };

    RegLex.Grammar = function (definition) {
        var grammar = (function () {
            var lexeme = null, regex = [], tokens = [];
            for (lexeme in definition) {
                if (definition.hasOwnProperty(lexeme)) {
                    tokens.push(new RegLex.Token(definition[lexeme]));
                    regex.push("(" + (("string" === typeof (definition[lexeme].expression)) ?
                        definition[lexeme].expression :
                        definition[lexeme].expression.source) +
                    ")");
                }
            }
            return {
                tokens: tokens,
                expression: new RegExp("^(?:" + regex.join("|") + ")")
            };
        })();

        this.expression = function () {
            return grammar.expression;
        };

        this.exec = function (str) {
            return grammar.expression.exec(str);
        };

        this.tokenAt = function (index) {
            if (index < grammar.tokens.length && index >= 0) {
                return grammar.tokens[index];
            } else {
                return null;
            }
        };
    };

    RegLex.Lexer = {};

    RegLex.Lexer.analyze = function (str, grammar) {
        var i = null, cpy = str, match = null, lts = [];
        while ("" !== cpy && null !== (match = grammar.exec(cpy))) {
            for (i = match.length - 1; i >= 1; i -= 1) {
                if ("" !== match[i]) {
                    lts.push({
                        token: grammar.tokenAt(i - 1).name(),
                        value: match[i]
                    });
                    break;
                }
            }
            cpy = cpy.substring(lts[lts.length - 1].value.length, cpy.length);
        }
        if ("" !== cpy) {
            throw new Error("Unrecognized sequence '" + cpy + "'.");
        }
        return lts;
    };

    if (callback) {
        callback(RegLex, $g, $lex);
    }

})(function () {
    window.RegLex = arguments[0];
    window.$g = arguments[1];
    window.$lex = arguments[2];
});