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
}

//add a commodity widget to the to the document
function addWidget(comIndex){
    //if there is an existing widget in the corresponding positon then that commodity has already been added
    if(widgetArray[comIndex] != null){
        console.log("Cannot add duplictate widget");
    }
    else{
        console.log("creating: " + comArray[comIndex].name + " widget");
        //create a new widget
        var widgetOb = new widget(comArray[comIndex], document.getElementById("div_widget"));
        //add the widget to the widgetArray
        widgetArray[comIndex] = widgetOb;
        //add the widget to the page
        widgetOb.add();
    }
}

//remove the clicked widget from the html page and the widgetArray
function removeWidget(widgetName){
    console.log("Removing widget: " + widgetName);
    //loop through the widget array and remove the widget matching the name
    for(var i = 0; i < widgetArray.length; i++){
        if((comArray[i].name + "_widget").localeCompare(widgetName) == 0){
            widgetArray[i].remove();
            widgetArray[i] = null;
        }
    }
}

class widget{
    constructor(commodity, parentElement){
        this.commodity = commodity;
        this.parentElement = parentElement;
    }
    add(){
        this.parentElement.innerHTML += `<p id="${this.commodity.name}_widget" onclick="removeWidget('${this.commodity.name}')">${this.commodity.name}</p>`;
    }
    remove(){
        document.getElementById(`${this.commodity.name}_widget`).remove;
    }
}