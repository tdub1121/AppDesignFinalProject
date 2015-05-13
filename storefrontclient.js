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
    var showCart = document.getElementById("showcart");
    if (username !== "") {
       // checkacct.innerHTML = "Welcome, " + username;
        var checkreq = new XMLHttpRequest();
        checkreq.onload = checkCheck;
        checkreq.open( "get", "checkcheck?"+username );
        checkreq.send();
        checkacct.innerHTML = "Welcome, " + getCookie("name") +"<br>";
        console.log(getCookie("cart"));
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

function checkCheck(){
    if(JSON.parse(this.responseText) === true){
        setCookie("cart", 0, 30);
    }
    var checkacct = document.getElementById("checkacct");
    checkacct.innerHTML += "You have "+ getCookie("cart").toString() +" items in your cart.";
}

function load2(){
    var table2 = new XMLHttpRequest();
    table2.onload = fillTable;
    table2.open( "get", "listitems" );
    table2.send();   
}
function addToCart(){
    console.log("asfasdf");
    if(getCookie("username") === ""){
        alert("Please sign in or create an account first.");
        return;
    }    
    var table3 = new XMLHttpRequest();
    table3.onload = addedtocart;
    table3.open("get", "showcart?" + this.itemID + "&" + getCookie("username"));
    table3.send();
}

function addedtocart(){
    var cookstr = getCookie("cart").toString();
    console.log(cookstr);
    var cooknum = parseInt(cookstr)+1;
    setCookie("cart", cooknum, 30);
    console.log(cooknum);
    window.location.href = "./";
}

function logout(){
    setCookie("username", "", 30);
    setCookie("name", "", 30);
    setCookie("cart", "", 30);
    window.location.href = "./";
}


function fillTable(){
    
  var items = JSON.parse(this.responseText);
  console.log(items.length);
  var table = document.getElementById("thetable");
  var tr1 = document.createElement("tr");
  var tr2 = document.createElement("tr");
  var tr3 = document.createElement("tr");
  var tr4 = document.createElement("tr");
  var tr5 = document.createElement("tr");
  for(var i = 1; i <= items.length; i++){
      var td1 = document.createElement("td");
      var td2 = document.createElement("td");
      var td3 = document.createElement("td");
      var td4 = document.createElement("td");
      var td5 = document.createElement("td");
      
      td1.innerHTML = items[i].NAME;
      var img = document.createElement("img");
      img.src = items[i].IMG;
      td2.appendChild(img);
      td2.className = "imgcell";
      td3.innerHTML = "$"+items[i].PRICE;
      td4.innerHTML = items[i].QUANTITY + " left in stock.";
     if (items[i].QUANTITY > 0){
      	 var addbutton = document.createElement( "input");
      	 addbutton.type = "button";
      	 addbutton.value = "Add to Cart";
      	 addbutton.onclick = addToCart;
         console.log(addbutton.onclick);
      	 addbutton.itemID = items[i].ID;
      	 td5.appendChild(addbutton);
     }
      td1.align = "center";
      td3.align = "center";
      td4.align = "center";
      td5.align = "center";
      tr1.appendChild(td1);
      tr2.appendChild(td2);
      tr3.appendChild(td3);
      tr4.appendChild(td4);
      tr5.appendChild(td5);
  }
  table.appendChild(tr1);
  table.appendChild(tr2);
  table.appendChild(tr3);
  table.appendChild(tr4); 
  table.appendChild(tr5);
}

function makeAccount(){
    var username = document.getElementById("usernameboxcreate").value;
    var pword = document.getElementById("passwordboxcreate").value;
    var name = document.getElementById("namebox").value;
    var accreq = new XMLHttpRequest();
    accreq.onload = accountMade;
    var url = "makeacct?"+"username="+username+"&"+"pword="+pword+"&"+"name="+name;
    console.log(url);
    accreq.open( "get", url );
    accreq.send();
}

function accountMade(){
    var information = JSON.parse(this.responseText);
    console.log(information.name);
    // document.cookie = "username="+information.name+"";
    setCookie("username", information.uname, 30);
    setCookie("name", information.name, 30);
    setCookie("cart", 0, 30);
    window.location.href = "./";
    console.log("asdfasdfasdf");
    
}

function login(){
    var uname = document.getElementById("usernamebox").value;
    var pword = document.getElementById("passwordbox").value;
    var url = "login?"+uname+"&"+pword;
    console.log("login");
    var loginreq = new XMLHttpRequest();
    loginreq.onload = loginAttempt;
    loginreq.open( "get", url );
    loginreq.send();
}

function loginAttempt(){
    if(this.responseText === ""){
        alert("Incorrect username or password.");        
    }
    else{
        var result = JSON.parse(this.responseText);
        setCookie("username", result.username, 30);
        setCookie("name", result.name, 30);
        console.log(result.cartSize);
        setCookie("cart", result.cartSize, 30);
        window.location.href = "./";
    }
}

function loadCart(){
    var table = document.getElementById("thetable");
    if(parseInt(getCookie("cart")) === 0){
        table.innerHTML = "You don't have any items in your cart!";
        return;
    }
    var cartreq = new XMLHttpRequest();
    cartreq.onload = showCart;
    cartreq.open( "get", "lookcart?" + getCookie("username") );
    cartreq.send();
}

function showCart(){
    var cart = JSON.parse(this.responseText);
    var table = document.getElementById("thetable");
    var price = 0;
    var tr1 = document.createElement("tr");
    var td11 = document.createElement("td");
    var td12 = document.createElement("td");
    td11.innerHTML = "Name";
    td12.innerHTML = "Price";
    tr1.appendChild(td11);
    tr1.appendChild(td12);
    table.appendChild(tr1);
    console.log(cart);
    for (i = 1; i <= cart.amount; i++){
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        price = price + cart[i].PRICE;
        td1.innerHTML = cart[i].NAME;
        td2.innerHTML = "$"+cart[i].PRICE.toFixed(2);
        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);
    }
    var tr2 = document.createElement("tr");
    var td21 = document.createElement("td");
    var td22 = document.createElement("td");
    var td23 = document.createElement("td");
    td21.innerHTML = "Total:";
    td22.innerHTML = "$"+price.toFixed(2);
    var checkoutb = document.createElement("input");
    checkoutb.type = "button";
    checkoutb.value = "Checkout";
    checkoutb.onclick = function() {
        var checkreq = new XMLHttpRequest();
        checkreq.onload = checkout;
        checkreq.open( "get", "checkout?" + price );
        checkreq.send();
    };
    td23.appendChild(checkoutb);
    tr2.appendChild(td21);
    tr2.appendChild(td22);
    tr2.appendChild(td23);
    table.appendChild(tr2);
}

function checkout(){
    console.log("asdfasdf");
    url = JSON.parse(this.responseText).split('"')[0];
    console.log(url);
    window.location.href = url;
}