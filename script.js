//500ms after the page loads get the commoditities
setTimeout(function(){
    console.log("SetTimeout function triggered");
    request = new XMLHttpRequest();
    comArray = new Array();
    getDataAjax();
},500);

// Create an XMLHttpRequest object to establish asynchronous communictaion to the database
var request;
// Create an array to hold all the commodity data
var comArray;


//call the php file that retreives names of commodities
let getDataAjax = () => {
    url = "getCommodities.php";

    console.log("executing getDataAjax");
    request.onload = storeData;
    request.open("GET",url);
    request.send("");
}

//Store commodity data returned from an Ajax request as objects into the comArray
let storeData = () => {
    console.log("executing storeData");

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
    //go through the commodity array and display all the commodity names
    for(var i = 0; i < comArray.length; i++){
        console.log("Commodity: " + comArray[i].name);
    }
    //sort the comArray by commodity name
    sortCom();
    //creat a dropbox of all the commodity items
}

//Sort commodities alphabetically by name in the array comArray using Selection Sort
function sortCom(){
    var tmp;
    var a = 0;
    var b = 0;

    for(a = 0; a < comArray.length; a++){
        for(b = a; b < comArray.length; b++){
            console.log("set: " + a + ", of " + b);
            //IF b < a THEN swap a and b
            console.log("comparing comArray[b]: " + comArray[b].name + ", against comArray[a]: " + comArray[a].name);
            var result = (comArray[b].name).localeCompare(comArray[a].name)
            console.log("result is:" + result);
            if(result < 0){
                console.log("result is smaller than 0");
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

//create a dropbox of all the commodity items
function createDropBox(){
    
}

//add a widget to the to the document
function addWidget(){
    //get the 
}


