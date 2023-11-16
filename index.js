/* 
    # fndt #
    ## by paishee ##
    
    ### links ###
    - https://github.com/paishee/fndt
    - https://npmjs.com/package/fndt

    (this shit is messy mb)
*/



// imports
const util = require('util');
const { Noodle, Soup } = require('stews');



// function data class
class FunctionData {
    constructor(f) {
        let strf = new Noodle(f.toString());
        let isArrow = false;


        // fixing arrow functions
        if (strf[0] == "(" ) {
            strf.pull("function");
            strf = strf.replace("=>", "");
            isArrow = true;
        }


        // fixing async arrow functions
        else if (strf.replace("async", "").trim()[0] == "(") {
            strf.pull("async function");
            strf = strf.replace("=>", "");
            isArrow = true;
        }
        

        // getting the argument indexes
        let [s, e] = [ strf.indexOf("(")+1, strf.indexOf(")") ];
        var stra = strf.slice(s, e)


        // if arguments exist
        let argsExist = stra.length > 0 || (eval(`"${stra.content}"`).length > 0 && stra.content)


        // if arguments exist bunch them up
        if (argsExist) stra = stra.bunch();


        // creates a shallow copy of the arguments for use in the body
        let argsCopy = stra.toString();


        // name fix
        let name = strf.toString().slice(0, s-1).replace("function", "").replace("async", "").trim();


        // function variables
        var fnv = Noodle.from(`return {${stra}}`);
        var fnr = {};


        // loop
        if (argsExist) {
            while (true) {

                // first try catch to see if it can be turned into an object
                // for some reason Function and eval give different outputs so this one uses Function
                
                try {

                    fnr = (new Function(fnv.toString()))(); // fnr = function result
                    break; // once it has finished it breaks the loop


                // catches errors
                } catch(e) {

                    var pt; // the part of the code the error is in
                    var uie = util.inspect(e); // uie = util inspect error
                    
                    if (e.name == "ReferenceError") { // if it's a reference error

                        uie = uie.slice( // slice it to get the first stuff of it
                            uie.indexOf(`at eval (eval at ${this.constructor.name}`), // start
                            uie.indexOf(`at new ${this.constructor.name}`) // end
                        );

                        let slcr = "<anonymous>:"; // thing to slice by

                        uie = uie.slice( // second slice to get the line and part of the code
                            uie.indexOf(slcr)+slcr.length, // start
                            uie.lastIndexOf(")") // end
                        );

                        pt = uie.split(":")[1]; // gets the part

                        fnv.append(pt, ":null"); // defines anything with no default value as null
                    }


                    else if (e.name == "SyntaxError") { // if it's a syntax error
                        
                        // second try catch which uses eval instead of Function for specific details
                        
                        try {
                            
                            eval(fnv.toString().replace("return ", "")); // removes the return statement for the eval
                        

                        // catches any new errors from the eval
                        } catch(ets) { // ets = e the second

                            // checks if the cause is because something isn't defined
                            if (ets.message.endsWith("is not defined")) {

                                var uiets = util.inspect(ets); // uiets = util inspect e the second

                                uiets = uiets.slice( // slice again to get the stuff
                                    uiets.indexOf(`at eval (eval at ${this.constructor.name}`), // start
                                    uiets.indexOf(`at new ${this.constructor.name}`) // end
                                );
            
                                let slcr = "<anonymous>:"; // thing to slice by
            
                                uiets = uiets.slice( // second slice to get the line and part of the code
                                    uiets.indexOf(slcr)+slcr.length, // start
                                    uiets.lastIndexOf(")") // end
                                );
            
                                pt = uiets.split(":")[1]; // gets the part

                                stra.append(pt-1, ":null"); // defines anything with no default value as null
                            }


                            // if it's an unexpected token telling it that there's an issue with the thing defined
                            else if (ets.message == "Unexpected token ':'") {

                                stra.set(pt-1, ""); // remove equal signs

                                // redefine the arguments string
                                stra = ((str=stra.toString()) => new Noodle(
                                    `${
                                        str.substr(0, pt-2) // sub out the beginning
                                    }:${
                                        // remove the "null" but leave the rest at the end
                                        ((sub=str.substr(pt-1, str.length)) => sub.slice(4, sub.length))()
                                    }`
                                ))();
                            }

                            else throw ets; // if it's neither throw the error as is

                            fnv = Noodle.from(`return {${stra}}`); // redefine fnv
                        }
                    }

                    else throw e; // if it's neither throw the error as is
                }
            }
        }


        this.name = (name != "") ? name : null; // name of the function if not given default to null
        this.dataName = (f.name != "") ? f.name : null; // name of the original function if not given default to null


        let isAsync = strf.startsWith("async");


        // body of the function
        this.body = strf.toString()
            .replace("function", "").trim() // remove the function text
            .replace(`${name}`, "").trim() // remove the name of the function
            .replace(`(${ (argsCopy.toString()) ? argsCopy.toString() : "" })`, "").trim() // remove the arguments

        if (isAsync) this.body = this.body.replace("async", "").trim();
        
        this.body = this.body.slice(1, this.body.length-1).trim(); // remove the brackets


        // function arguments
        this.arguments = Soup.from(fnr)
            .map( (k, v, i) => (typeof v == "string") ? v.trim() : v) // remove white space in values
            .mapKeys( (k, v, i) => (typeof k == "string") ? k.trim() : k ) // remove white space in keys
            .pour(); // pour down into an object

        
        // if it's an async function    
        this.isAsync = isAsync;


        // if it's an arrow function
        this.isArrow = isArrow;


        // function data
        this.data = f;


        // a string version of the function
        this.string = strf.toString();
    }
}



// exports
module.exports = { FunctionData, fetch(f) {
    return new FunctionData(f);
}};
