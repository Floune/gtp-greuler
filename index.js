const axios = require("axios");
import greuler from 'greuler'
let instance;
let data;
let conf;
let iterator = 1;

function init() {
    axios.get("https://get-to-philosophy.herokuapp.com/history").then(history => {
        data = history.data.words
        instance = greuler(makeConf(take(data, iterator)))
        instance.update()
        watchers()
    })

    const then = function() {
        debugger
        iterator++
        //instance = greuler()
        const nodes = data[iterator].map(()=>{
            createNode("Connaissance_(philosophie)", 80, "red")
            }
        )
        instance.options.data.nodes.push
        instance.update()

        return then
    }

    return then
}

function take(arr, count) {
    return arr.slice(0, count);
}


window.init = init()

function watchers() {
    document.body.addEventListener("click", (e) => {
        if (e.target.localName === "circle" || e.target.localName === "text") {
            console.log("kikou", e.target)
            //debugger
        }
    })
}



function makeConf(words) {
    const conf = {
        target: "#app",
        data: {
            avoidOverlaps: true,
            nodes: [],
            edges: [],
        },
    }
    const initialNode = createNode("Connaissance_(philosophie)", 80, "red")
    const aggregateNodes = ["Connaissance_(philosophie)"]
    const aggregateEdges = []
    const nodes = [initialNode]
    const edges = []
    let previous;

    const limit = 20
    for (let i = 0; i < words.length; i++){
        if (i === limit) {
            break;
        }
        previous = initialNode;
        const key = Object.keys(words[i])[0]
        const defs = words[i][key]
        for (let j = defs.length - 1; j >= 0; j--) {
            const edgeName = `${previous.id}-${defs[j]}`
            if (aggregateEdges.indexOf(edgeName) === -1) {
                edges.push(createEdge(defs[j],previous.id))
                aggregateEdges.push(edgeName)
            }
            previous = {id: defs[j]}
            if (aggregateNodes.indexOf(defs[j]) === -1) {
                j === 1 ? nodes.push(createNode(defs[j], 35, "pink")) : nodes.push(createNode(defs[j]))
                aggregateNodes.push(defs[j])
            }
        }

    }

    return {
    ...conf,
    ...{
        data: {nodes, edges}
    }
    }
}

function createNode(elem, size = 35, color = "blue") {
    return {
        fill: color,
        id: decodeURI(elem),
        r: size,
        label: decodeURI(elem),
        color: "black",
    }
}


function createEdge(source, target) {
    return {
        source: decodeURI(source),
        target: decodeURI(target),
        directed: true,
    }
}
