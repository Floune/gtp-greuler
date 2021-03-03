import greuler from 'greuler'
const axios = require("axios");
let instance;
let history;
var diff = require("fast-array-diff");

function inite(words) {
    const conf = makeConf(words)
    instance = greuler(conf).update()
    watchers()
}


function watchers() {
    document.querySelector(".form").addEventListener("submit", (e) => {
        e.preventDefault();
        fetchWord(e.target[0].value)
    })

    document.body.addEventListener("click", (e) => {
        if (e.target.localName === "circle" || e.target.localName === "text") {
            console.log("kikou", e.target)
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
    const initialNode = createNode("Connaissance_(philosophie)", 80, "#00bbf9")
    const aggregateNodes = ["Connaissance_(philosophie)"]
    const aggregateEdges = []
    const nodes = [initialNode]
    const edges = []
    let previous;
    const limit = 100
    let keys = Object.keys(words)
    for (let i = 0; i < keys.length; i++){
        if (i === limit) {
            break;
        }
        previous = initialNode;
        const key = keys[i]

        const defs = words[key]
        for (let j = defs.length - 1; j >= 0; j--) {
            const edgeName = `${previous.id}-${defs[j]}`
            if (aggregateEdges.indexOf(edgeName) === -1 && defs[j] !== "Entrée inexistante" && defs[j] !== "arret") {
                edges.push(createEdge(defs[j],previous.id))
                aggregateEdges.push(edgeName)
            }
            if (aggregateNodes.indexOf(defs[j]) === -1) {
                j === 0 ? nodes.push(createNode(defs[j], 35, "#f15bb5")) : nodes.push(createNode(defs[j]))
                aggregateNodes.push(defs[j])
            }
            previous = {id: defs[j]}

        }

    }

    return {
        ...conf,
        ...{
            data: {nodes, edges}
        }
    }
}

function createNode(elem, size = 35, color = "#fee440") {
    return {
        fill: color,
        id: decodeURI(elem),
        r: size,
        label: decodeURI(elem),
        color: "black",
    }
}


function createEdge(source, target) {
    console.log("edge", source, target)
    return {
        source: decodeURI(source),
        target: decodeURI(target),
        directed: true,
    }
}

function updateGraph(old) {
    axios.get("https://get-to-philosophy.herokuapp.com/history").then(newList => {
        document.getElementById("loading").style.display = "none"
        const aggregateNodes = instance.graph.nodes
        const aggregateEdges = []
        let intersection = diff.diff(Object.keys(old), Object.keys(newList.data.words));
        let newBranch = newList.data.words[intersection["added"][0]]
        let previous = {id: "Connaissance_(philosophie)"}
        for (let j = newBranch.length - 1; j >= 0; j--) {
            if (existed(newBranch[j], aggregateNodes) === false) {
                j === 0 ? instance.graph.addNode(createNode(newBranch[j], 35, "#f15bb5")) : instance.graph.addNode(createNode(newBranch[j]))
            }
            const edgeName = `${previous.id}-${newBranch[j]}`
            if (aggregateEdges.indexOf(edgeName) === -1 && newBranch[j] !== previous.id && newBranch[j] !== "Entrée inexistante" && newBranch[j] !== "arret") {
                instance.graph.addEdge(createEdge(newBranch[j],previous.id))
                aggregateEdges.push(edgeName)
            }


            previous = {id: newBranch[j]}

        }
        instance.update()

    })
}

function existed(check, history) {
    let aexisted = false
    history.forEach(item => {
        if (decodeURI(check) === item.id) {
            aexisted =  true
        }
    })
    return aexisted
}

function fetchWord(word) {
    document.getElementById("loading").style.display = "block"
    axios.get("https://get-to-philosophy.herokuapp.com/history").then(old => {
        axios.get("https://get-to-philosophy.herokuapp.com/gtp?s=" + word).then((res) => {
            updateGraph(old.data.words)
        })
    })
}


function start() {
    axios.get("https://get-to-philosophy.herokuapp.com/history").then(history => {
        history = history.data.words
        inite(history)
    })
}

start()
