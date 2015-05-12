//Cookie functions from http://www.w3schools.com/js/js_cookies.asp

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
} 

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
    }
    return "";
} 

function load(){
  var tablereq = new XMLHttpRequest();
  tablereq.onload = fillTable;
  tablereq.open( "get", "featureditems" );
  tablereq.send();
  var username = getCookie("username");
  var checkacct = document.getElementById("checkacct");
  if (username !== "") {
        checkacct.innerHTML = "Welcome, " + getCookie("name");
        var p = document.createElement("p");
        var out = document.createElement("input");
        out.type = "button";
        out.value = "Log Out";
        out.onclick = logout;
        p.appendChild(out);
        checkacct.appendChild(p);
    }
  else{
        // checkacct.innerHTML = "Please click here to create an account.";
        // checkacct.onclick = getAcctPage;
        var link = document.createElement("a");
        link.innerHTML = "Please click here to create an account.";
        link.href = "./makeaccount.html";
        checkacct.appendChild(link);
  }
}

function logout(){
    setCookie("username", "", 30);
    window.location.href = "./";
}

function fillTable(){
  var items = JSON.parse(this.responseText);
  console.log(items[1].NAME);
  var table = document.getElementById("thetable");
  var tr1 = document.createElement("tr");
  var tr2 = document.createElement("tr");
  var tr3 = document.createElement("tr");
  var tr4 = document.createElement("tr");
  for(var i = 1; i < 4; i++){
    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");
    var td4 = document.createElement("td");
    td1.innerHTML = items[i].NAME;
    var img = document.createElement("img");
    img.src = items[i].IMG;
    td2.appendChild(img);
    td2.className = "imgcell";
    td3.innerHTML = "$"+items[i].PRICE;
    td4.innerHTML = items[i].QUANTITY + " left in stock.";
    td1.align = "center";
    td3.align = "center";
    td4.align = "center";
    tr1.appendChild(td1);
    tr2.appendChild(td2);
    tr3.appendChild(td3);
    tr4.appendChild(td4);
  }
  table.appendChild(tr1);
  table.appendChild(tr2);
  table.appendChild(tr3);
  table.appendChild(tr4); 
}

function makeAccount(){
    var username = document.getElementById("usernameboxcreate").value;
    var pword = document.getElementById("passwordboxcreate").value;
    var name = document.getElementById("namebox").value;
    var addr = document.getElementById("addbox").value;
    var phone = document.getElementById("phonebox").value;
    var card = document.getElementById("cardbox").value;
    var accreq = new XMLHttpRequest();
    accreq.onload = accountMade;
    var url = "makeacct?"+"username="+username+"&"+"pword="+pword+"&"+"name="+name+"&"+"addr="+addr+"&"+"phone="+phone+"&"+"card="+card;
    console.log(url);
    accreq.open( "get", url );
    accreq.send();
}

function accountMade(){
    var information = JSON.parse(this.responseText);
    console.log(information.name);
    // document.cookie = "username="+information.name+"";
    setCookie("username", information.uname, 30);
    setCOokie("name", information.name, 30);
    window.location.href = "./";
    console.log("asdfasdfasdf");
    
}