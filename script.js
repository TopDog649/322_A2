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
// An array to hold all the widgets
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
let storeData = () => {
    //insert all the commodity data into the commodity array
    var response = JSON.parse(request.responseText);
    comArray.length = response.length;
    for(let i = 0; i < response.length; i++){
        var comName = response[i].name;
        var comInfo = response[i].information;
        var comCode = response[i].code;
        var commodity = {
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

//add a commodity widget to the to the document
function addWidget(comIndex){
    //if there is an existing widget in the corresponding positon then that commodity has already been added
    if(widgetArray[comIndex] != null){
        console.log("Cannot add duplictate widget");
    }
    else{
        console.log("creating: " + comArray[comIndex].name + " widget");
        //create a new widget, the id will be the index of the commodity Array for quick indexing
        var widgetOb = new widget(comArray[comIndex], document.getElementById("div_widget"));
        //add the widget to the widgetArray
        widgetArray[comIndex] = widgetOb;
    }
}

//remove the clicked widget from the html page and the widgetArray
function removeWidget(id){
    console.log("Removing commodity of id/index: " + id + ", and name: " + comArray[id].name);
    widgetArray[id].remove();
    widgetArray[id] = null;
}

function graphWidget(id){
    if(chartInstance != null){
        chartInstance.destroy();
    }
    widgetArray[id].graph()
}

function compareCommodity(id){
    //widgetArray[id].compare();
}

class widget{
    constructor(commodity, parentElement){
        this.commodity = commodity;
        this.parentElement = parentElement;
        this.add();
    }
    add(){
        this.parentElement.innerHTML += 
        `<div id="${this.commodity.id}_widget" class="widget">
        <p>${this.commodity.name}</p>
        <p>${this.commodity.info}</p>
        <button class="control" onclick="removeWidget(${this.commodity.id})">Remove</button>
        <button class="control" onclick="graphWidget(${this.commodity.id})">Graph</button>
        <button class="control" onclick="compareCommodity(${this.commodity.id})">Compare</button>
        </div>`;
    }
    remove(){
        document.getElementById(`${this.commodity.id}_widget`).remove();
    }
    graph(){
        console.log("Graphing: " + this.commodity.code);
        url = `https://www.alphavantage.co/query?function=${this.commodity.code}&interval=monthly&apikey=5V5P85DFCVQ5FLJP`
        
        //get the weather data and format it as json
        try{
            fetch(url,{method: 'GET'})
            .then(response => response.json())
            .then(this.displayGraph);
        }
        catch(error){
            console.error(error);
        }
    }
    displayGraph = (response) => {
        console.log(response.data[0].value.toString());
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
                        text: response.name
                    }
                }
            }
        };

        chartInstance = new Chart(document.getElementById("commodityGraph"),config);
    }
    compare(commodity){

    }
}