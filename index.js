/* 
    # fncdt #
    ## by paishee ##

    (this shit is messy mb)
*/



// imports
const util = require('util');
const { Noodle } = require('stews');



// function data class
class FunctionData {
    constructor(f) {
        let strf = new Noodle(f.toString());


        // fixing arrow functions
        if (strf[0] == "(") {
            strf.pull("function");
            strf = strf.replace("=>", "");
        }
        

        // getting the argument indexes
        let [s, e] = [ strf.indexOf("(")+1, strf.indexOf(")") ];
        var stra = strf.slice(s, e);

        let argsCopy = stra.toString();


        // name fix
        let name = strf.toString().slice(0, s-1).replace("function", "").trim();


        // function variables
        var fnv = Noodle.from(`return {${stra}}`);
        var fnr = {};


        // loop
        if (stra.length > 0) {
            while (true) {

                try {
                    fnr = (new Function(fnv.toString()))(); // fnr = function result
                    break;
                } catch(e) {

                    var ln, pt;
                    var uie = util.inspect(e); // uie = util inspect error
                    
                    if (e.name == "ReferenceError") {
                        uie = uie.slice(
                            uie.indexOf(`at eval (eval at ${this.constructor.name}`), // start
                            uie.indexOf(`at new ${this.constructor.name}`) // end
                        );

                        let slcr = "<anonymous>:";

                        uie = uie.slice(
                            uie.indexOf(slcr)+slcr.length, // start
                            uie.lastIndexOf(")") // end
                        );

                        [ln, pt] = ((spl=uie.split(":")) => [spl[0], spl[1]] )();

                        fnv.append(pt, ":null");
                    }

                    else if (e.name == "SyntaxError") {
                        try {
                            eval(fnv.toString().replace("return ", ""))
                        } catch(ets) { // ets = e the second

                            if (ets.message.endsWith("is not defined")) {
                                var uiets = util.inspect(ets);

                                uiets = uiets.slice(
                                    uiets.indexOf(`at eval (eval at ${this.constructor.name}`), // start
                                    uiets.indexOf(`at new ${this.constructor.name}`) // end
                                );
            
                                let slcr = "<anonymous>:";
            
                                uiets = uiets.slice(
                                    uiets.indexOf(slcr)+slcr.length, // start
                                    uiets.lastIndexOf(")") // end
                                );
            
                                [ln, pt] = ((spl=uiets.split(":")) => [spl[0], spl[1]] )();

                                stra.append(pt-1, ":null");
                            }

                            else if (ets.message == "Unexpected token ':'") {

                                stra.set(pt-1, "");

                                stra = ((str=stra.toString()) => new Noodle(
                                    `${
                                        str.substr(0, pt-2)
                                    }:${
                                        ((sub=str.substr(pt-1, str.length)) => sub.slice(4, sub.length))()
                                    }`
                                ))();
                            }

                            else throw ets;

                            fnv = Noodle.from(`return {${stra}}`);
                        }
                    }

                    else throw e;
                }
            }
        }


        this.name = name; // name of the function
        this.dataName = f.name;


        // body of the function
        this.body = strf.toString()
            .replace("function", "").trim()
            .replace(`${name}`, "").trim()
            .replace(`(${ (argsCopy.toString()) ? argsCopy.toString() : "" })`, "").trim()
        
        this.body = this.body.slice(1, this.body.length-1);


        // function arguments
        this.arguments = fnr;


        // function data
        try {
            (new Function('t', `t.data = ${strf.toString()}`))(this);
        } catch {
            this.data = f;
        }


        // a string version of the function
        this.string = strf.toString();
    }
}



// exports
module.exports = { FunctionData, fetch(f) {
    return new FunctionData(f);
}};
