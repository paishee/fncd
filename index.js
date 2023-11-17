/* 
    # fndt #
    ## by paishee ##
    
    ### links ###
    - https://github.com/paishee/fndt
    - https://npmjs.com/package/fndt

    (this shit is messy mb)
*/



// imports
const cl = require('aepl');
const util = require('util');
const { Noodle, Soup } = require('stews');



// scope functions
const isStringChar = (char) => [`"`, `'`, "`"].includes(char);
const hasStringChar = (string) => string.split(``).some(isStringChar);



// errors
const err = ( message ) => { 
    let e = new Error(message);
    e.name = "FndtError";

    throw e;
};



// function data class
class FunctionData {
    constructor(f, callback) {
        if (!f) err("No function given");


        // pending stuff
        this.pending = true;
        var penders = [];


        // then function
        this.__proto__.then = (callback) => { penders.push(callback); return callback };
        if (callback) this.then(callback);


        // inspect function
        this.__proto__[util.inspect.custom] = (depth) => {
            if (this.pending) {
                return `FunctionData \x1b[33m\x1b[3m[pending]\x1b[0m`;
            }
            else {
                return `FunctionData ${ util.inspect(Object.fromEntries(Object.entries(this)), { colors: true } ) }`;
            }
        }


        // immediately get the main code is ran it actually gets the data that way it doesn't delay code
        setImmediate( () => {


            // turn the function into a string and remove duplicate spaces
            let strf = new Noodle(f.toString()).replace(/ +(?= )/g, "");
            let isArrow = false;


            // if the function is native code throw an error
            if (strf.has("[native code]")) err("Cannot fetch from native code.");



            // fixing arrow functions
            if (strf[0] == "(" ) {
                strf.pull("function");
                strf = strf.replace("=>", "");
                isArrow = true;
            }



            // fixing async arrow functions
            else if (strf.replace("async", "").trim()[0] == "(") {
                strf = strf.replace("async", "").trim()
                strf.pull("async function");
                strf = strf.replace("=>", "");
                isArrow = true;
            }



            // if the function is async
            let isAsync = strf.startsWith("async");



            // start of the arguments
            let start = strf.indexOf("(")+1;



            // fix name
            let rawName = strf.toString().slice(0, start-1).trim().replace("function", "").trim() // remove the function text and stuff
            if (isAsync) rawName = rawName.replace("async", "").trim(); // if it's an async function remove the async
            

            let name = (rawName != "") ? rawName : null; // name of the function
            let dataName = (f.name != "") ? f.name : null; // name of the original function
            


            // separating the arguments
            let stra = Noodle.from( 

                ( Soup.from((
                    (s=strf.replace("function", "").trim()) => {


                        if (isAsync) s = s.replace("async", "").trim();
                        if (name) s = s.replace(name, "").trim();


                        let scopes = {
                            left: [ 
                                "("
                            ],
                            right: [ 
                                ")"
                            ]
                        };


                        s = s.substring(1, s.length - 1).trim();


                        let scope = ``;
                        let collector = ``;
                        let stuff = [];


                        for (let i = 0; i < s.length; i++) { // loop through string
                            let char = s[i];

                        
                            if (scopes.left.includes(char) && (!scopes.right.includes(char) || !scope.endsWith(char))) scope += char;
                            else if (scopes.right.includes(char) && scope.endsWith(scopes.left[scopes.right.indexOf(char)])) scope = scope.substring(0, scope.length - 1);
                    

                            if (!scope && char.match(/\)/g) && (() => { 

                                for (let n = i; n < s.replace(/ +(?= )/g, "").length; n++) {
                                    let next = s.replace(/ +(?= )/g, "")[n];
                                    if (next == "{") return true;
                                }

                                return false;

                            })()) {
                                const value = collector.split(/\)/g);

                                collector = ``
                                stuff.push(value);

                            } else collector += char;
                        }


                        if (scope) err("Scope for isolating arguments didn't end.");


                        else {
                            const value = collector;

                            collector = ``;
                            stuff.push(value.trim());
                        }

                        return stuff;
                    }
                )())

                .filter( (v, i) => {
                    return v instanceof Array;
                })

                .map( (v, i) => {
                    return v.join(" ").trim();
                })

                .join(" ")
            ));



            // if arguments exist
            let argsExist = stra.length > 0 || (eval(`"${stra.content}"`).length > 0 && stra.content)



            // if arguments exist bunch them up
            if (argsExist) stra = stra.bunch();



            // creates a shallow copy of the arguments for use in the body
            let argsCopy = stra.toString();



            // function variables
            var args = {};



            // loop
            if (argsExist) { 


                let chars = new Soup({
                    '{': `}`,
                    '[': `]`,
                    '(': `)`,
                    '"': `"`,
                    "'": `'`,
                    '`': '`'
                });


                let scopes = {
                    left: chars.keys,
                    right: chars.values
                };
                

                let stuff = `{ ${stra} }`;
                let s = stuff.substring(1, stuff.length - 1).trim();
            

                let scope = ``;
                let collector = ``;


                for (let char of s) { // loop through string
                    
                    
                    // checking scopes
                    if (scopes.left.includes(char) && (!scopes.right.includes(char) || !scope.endsWith(char))) scope += char;
                    else if (scopes.right.includes(char) && scope.endsWith(scopes.left[scopes.right.indexOf(char)])) scope = scope.substring(0, scope.length - 1);


                    // error thing
                    else if (scopes.right.includes(char) && !hasStringChar(scope)) err("A character in the scope is not a valid string." );
            

                    if (!scope && char == `,`) { // go to next key/value pair
                        const [key, ...value] = collector.split(`=`);

                        if (value.length <= 0) value.push('null');

                        collector = ``
                        args[key.trim()] = value.join(`=`)

                    } else collector += char
                }
            

                if (scope) err("Scope for parsing and formatting arguments didn't end.");


                else {
                    const [key, ...value] = collector.split(`=`);

                    if (value.length <= 0) value.push('null');

                    collector = ``;
                    args[key.trim()] = value.join(`=`);
                }


                args = new Soup(args)
                

                .map( (k, v, i) => {
                    return new Function(`return ${v};`)();
                })


                .pour();
            }



            this.name = name; // name of the function
            this.dataName = dataName; // name of the original function



            // body of the function
            this.body = strf.toString()
                .replace("function", "").trim() // remove the function text

            if (isAsync) this.body = this.body.replace("async", "").trim(); // remove the async text  
            

            if (name) this.body = this.body.replace(`${name}`, "").trim() // remove the name of the function


            if (argsExist) this.body = this.body.replace(`(${ (argsCopy.toString()) ? argsCopy.toString() : "" })`, "").trim() // remove the arguments
            else this.body = this.body.replace("()", "").trim();
            

            this.body = this.body.slice(1, this.body.length-1).trim(); // remove the brackets



            // function arguments
            this.arguments = Soup.from(args)
                .map( (k, v, i) => (typeof v == "string") ? v.trim().replace(/ +(?= )/g, "") : v) // remove white space in values
                .mapKeys( (k, v, i) => (typeof k == "string") ? k.trim().replace(/ +(?= )/g, "") : k ) // remove white space in keys
                .pour(); // pour down into an object

            


            // if it's an async function    
            this.isAsync = isAsync;



            // if it's an arrow function
            this.isArrow = isArrow;



            // function data
            this.data = f;



            // a string version of the function
            this.string = strf.toString();


            this.pending = false;


            penders.forEach( p => p(this) );
        });
    }
}



// exports
module.exports = { 
    FunctionData: cl.init("FunctionData", FunctionData), 

    fetch(f, callback) {
        return (new FunctionData(f, callback));
    }
};
