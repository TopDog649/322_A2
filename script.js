//500ms after the page loads get the commoditities
setTimeout(function(){
    request = new XMLHttpRequest();
    comArray = new Array();
    widgetArray = new Array();
    getDataAjax();
},500);

// Create an XMLHttpRequest object to establish asynchronous communictaion to the database
var request;
// An array to hold all the commodity data
var comArray;
// An array to hold all the widgets, the widget's commodity id's match its index and the index of comArray[]
var widgetArray;
//global chart object
var chartInstance;

//call the php file that retreives names of commodities
let getDataAjax = () => {
    url = "getCommodities.php";
    request.onload = storeData;
    request.open("GET",url);
    request.send("");
}

//Store commodity data returned from an Ajax request as objects into the comArray
//We also want to sort the arrary and add the commodity names to the dropdown list
let storeData = () => {
    //insert all the commodity data into the commodity array
    var response = JSON.parse(request.responseText);
    comArray.length = response.length;
    for(let i = 0; i < response.length; i++){
        var comName = response[i].name;
        var comInfo = response[i].information;
        var comCode = response[i].code;
        //Create a commodity as an object literal
        var commodity = {
            //the id will correspond to the index of the commodity in comArray[] not the id from the database
            id : i,
            name : comName,
            info : comInfo,
            code : comCode
        }
        comArray[i] = commodity;
    }
    //set the widgetArray to the size of comArray, as we can't store more widgets than commodites
    widgetArray.length = comArray.length;

    //sort the comArray by commodity name
    sortCom();

    //go through the commodity array and display all the commodity names in a drop down list
    var dropdownList = document.getElementById("commodities_list");
    for(var i = 0; i < comArray.length; i++){
        dropdownList.innerHTML += `<option onclick="addWidget(${i})" >${comArray[i].name}</option>`;
    }
}

//Sort commodities alphabetically by name in the array comArray using Selection Sort
function sortCom(){
    var tmp;
    var a = 0;
    var b = 0;

    for(a = 0; a < comArray.length; a++){
        for(b = a; b < comArray.length; b++){
            //IF b < a THEN swap a and b
            var result = (comArray[b].name).localeCompare(comArray[a].name)
            if(result < 0){
                //temp sore a
                tmp = comArray[a];
                //set b to a position
                comArray[a] = comArray[b];

                //set tmp a to b positon
                comArray[b] = tmp;
            }
        }
    }
    //loop through the commodity array and reset the id's for indexing
    for(var i = 0; i < comArray.length; i++){
        comArray[i].id = i;
    }
}

/**
 * add and create a widget which will display the commodity's name and information
 * @param {*} comIndex the commodity's index in the comArray[] that we want to  create a widget for
 */
function addWidget(comIndex){
    //Check the widget isn't a duplicate
    if(widgetArray[comIndex] != null){
        console.log("Cannot add duplictate widget");
    }
    else{
        //create a new widget, the id will be the index of the commodity Array for quick indexing
        var widgetOb = new widget(comArray[comIndex], document.getElementById("div_widget"));
        //add the widget to the widgetArray
        widgetArray[comIndex] = widgetOb;
    }
}

/**
 * removes the widget from the html page and the widgetArrray[]
 * @param {*} id of the widget commodity that we want to remove from the widget's parent element 
 * and widget array
 */
function removeWidget(id){
    console.log("Removing commodity of id/index: " + id + ", and name: " + comArray[id].name);
    widgetArray[id].remove();
    widgetArray[id] = null;
}

/**
 * Graph the widget's commodity
 * @param {*} id the id of widget's commodity that we want to graph
 */
function graphWidget(id){
    if(chartInstance != null){
        chartInstance.destroy();
    }
    //remove the comparing graph values and name
    //as this will only display one commodity's values
    widgetArray[id].compareDataArray = null;
    widgetArray[id].compareComName = null;
    //graph the individual value
    widgetArray[id].graph();
}

/**
 * compareCommodity(id, comparingId) will graph the commodity belonging to the widget and the commodity selected
 * from the drop down list
 * @param {*} id id of the commodity belonging to the widget
 * @param {*} comparingId the id of the commodity that we want to add to the graph and compare
 */
function compareCommodity(id, comparingId){
    widgetArray[id].compare(comArray[comparingId]);
}

/**
 * Widget class
 * Construcor initialses its own commodity properties and add's itself to the html page under a parent element
 * multiple functions to add and remove widgets as well as graph the commodity values which can compare against each other.
 */
class widget{
    /**
     * CONSTRUCTOR initialises values, then adds a widget under parentElement
     * @param {*} commodity the main commodity property that will be displayed in the widget and graph
     * @param {*} parentElement the parent element that can store the widget
     */
    constructor(commodity, parentElement){
        this.commodity = commodity;
        this.parentElement = parentElement;
        this.compareDataArray = null;
        this.comparingComName = null;
        this.add();
    }
    //add a widget under this.parentElement containing a div, 3 buttons, 2 paragraphs, and a drop down list box
    add(){
        this.parentElement.innerHTML += 
        `<div id="${this.commodity.id}_widget" class="widget">
        <p>${this.commodity.name}</p>
        <p>${this.commodity.info}</p>
        <button class="control" onclick="removeWidget(${this.commodity.id})">Remove</button>
        <button class="control" onclick="graphWidget(${this.commodity.id})">Graph</button>
        <select class="control" id="compare${this.commodity.id}">
            <option>Compare</option>
        </select>
        </div>`;

        //Populate the Drop down list
        var dropDownList = document.getElementById(`compare${this.commodity.id}`);
        for(var i = 0; i < comArray.length; i++){
            //Add a commodity to the list that isn't the existing commodity
            if(comArray[i].id != this.commodity.id){
                dropDownList.innerHTML += `<option onclick="compareCommodity(${this.commodity.id}, ${comArray[i].id})">${comArray[i].name}</option>`;
            }
        }
    }
    //remove the widget from html by calling its own id
    remove(){
        document.getElementById(`${this.commodity.id}_widget`).remove();
    }
    //Send an API call to alphavantage and display a graph of the commodity data
    graph(){
        console.log("Graphing: " + this.commodity.code);
        url = `https://www.alphavantage.co/query?function=${this.commodity.code}&interval=monthly&apikey=5V5P85DFCVQ5FLJP`
        
        //get the commodity data and format it as json THEN display values as a graph
        try{
            fetch(url,{method: 'GET'})
            .then(response => response.json())
            .then(this.displayGraph);
        }
        catch(error){
            console.error(error);
        }
    }
    //display a chart.js graph on the html canvas with the commodity and comparing commodity values
    //comparing commodity values are only displayed if compareDataArray[] is initialsed
    displayGraph = (response) => {
        try{
            console.log(response.data[0].value.toString());
        }
        catch(err){
            alert("Slow down! The API call frequency is 5 calls per minute and 500 calls per day.");
            return;
        }
        //get an array of dates
        var dateArray = new Array(12);
        for(var a = 0; a < 12; a++){
            dateArray[a] = response.data[a].date;
        }
        //get an array of values
        var valueArray = new Array(12);
        for(var b = 0; b < 12; b++){
            valueArray[b] = response.data[b].value;
        }

        //IF we have a comparison commodity value array THEN add it to the graph along with commodity array values
        if(this.compareDataArray != null){
            var data = {
                labels: dateArray,
                datasets: [
                    {
                        label: this.commodity.name,
                        data: valueArray,
                        backgroundColor: ["rgb(193,144,47)"],
                    },
                    {
                        label: this.compareComName,
                        data: this.compareDataArray,
                        backgroundColor: ["rgb(112,110,102)"],
                    }
                ]
            };
        }
        //ELSE just display the graph with this commodity values
        else{
            console.log("Graphing one value");

            var data = {
                labels: dateArray,
                datasets: [
                    {
                        label: this.commodity.name,
                        data: valueArray,
                        backgroundColor: ["rgb(193,144,47)"],
                    },
                ],
            };
        }


        var config = {
            type: "line",
            data: data,
            options: {
                responsive: true,
                plugins:{
                    legend:{
                        position:'top',
                    },
                    title:{
                        display: true,
                        text: "Monthly commodity price"
                    }
                }
            }
        };

        chartInstance = new Chart(document.getElementById("commodityGraph"),config);
    }
    //Send an API call to alphavantage and display a graph of the commodity data and the comparing commodity data
    compare(compareCommodity){
        //If the html canvas has a chart instance, destroy it
        if(chartInstance != null){
            chartInstance.destroy();
        }
        //Store the name of the comparing commodity for a graph legend
        this.compareComName = compareCommodity.name;

        url = `https://www.alphavantage.co/query?function=${compareCommodity.code}&interval=monthly&apikey=5V5P85DFCVQ5FLJP`
        
        //GET the commodity data THEN format it as json THEN store the response values
        try{
            fetch(url,{method: 'GET'})
            .then(response => response.json())
            .then(this.displayComparison);
        }
        catch(error){
            console.error(error);
        }
    }
    //Store the data values in the response as the comparison data array of values
    // then display a graph of the commodity data and the comparing commodity data
    displayComparison = (response) => {
        this.compareDataArray = new Array(12);
        //try to get the resonse data values, an error will generate if the
        //user requests too many API calls at once
        try{
            //get an array of values
            for(var b = 0; b < 12; b++){
                this.compareDataArray[b] = response.data[b].value;
            }
        }
        catch(err){
            alert("Slow down! The API call frequency is 5 calls per minute and 500 calls per day.");
            return;
        }
        //graph the results
        this.graph();
    }
}