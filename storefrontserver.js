var fs = require( "fs" );
var https = require( "https" );
var sqlite = require( "sqlite3" );
var crypto = require( "crypto" );
var paypal_api = require('paypal-rest-sdk');
var paid = false;

function fillTable(res)
{
  
    var db = new sqlite.Database("StoreFront.sqlite");
    var rows = {};
    rows.length = 0;
    db.each("SELECT * FROM ITEM WHERE ID = 1 OR ID = 2 OR ID = 3", function(err,row){
        rows[row.ID] = row;
	      rows.length++;
    });        
    db.close(function(){
        res.writeHead(200);
        res.end(JSON.stringify(rows));
    });
}
function fillTable2(res)
{
    var db = new sqlite.Database("StoreFront.sqlite");
    var rows = {};
    rows.length = 0;
    db.each("SELECT * FROM ITEM", function(err,row){
        rows[row.ID] = row;
	  rows.length++;
    });        
    db.close(function(){
  	res.writeHead(200);
  	res.end(JSON.stringify(rows));
    });
}
function addtocart(filename, req, res )
{
    console.log("here?");
    var db = new sqlite.Database( "StoreFront.sqlite" );
    var url = filename.split("?")[1];
    var userInfo = url.split("&");
    var itemId = userInfo[0];
    var username = userInfo[1];
    var usercart = {};
    var q = "";
    db.each("SELECT * FROM CUSTOMER WHERE USERNAME = '" + username + "'",
	     function(err,row){
          usercart = JSON.parse(row.CART);
          console.log(usercart);
		 });
    
    db.close(
  	function(){
        var db2 = new sqlite.Database( "StoreFront.sqlite" );
        db2.each("SELECT * FROM ITEM WHERE ID = "+itemId,
          function(err,row){
              console.log(usercart.amount);
              usercart.amount = usercart.amount + 1;
              console.log(usercart.amount);
              usercart[usercart.amount] = row;
              console.log(usercart);
              q = row.QUANTITY;
    	        res.writeHead(200);
    	        res.end("");
          });
          db2.close(function(){
              var db3 = new sqlite.Database( "StoreFront.sqlite" );
              var sqlcmd = "UPDATE CUSTOMER \n SET CART='"+JSON.stringify(usercart)+"'\n WHERE USERNAME = '" + username + "'";
              db3.run(sqlcmd);
              db3.each("SELECT CART FROM CUSTOMER WHERE USERNAME = '" + username + "'", function(err, row){
                  console.log(JSON.parse(row.CART));
              });
              var sqlcmd2 = "UPDATE ITEM \n SET QUANTITY='"+(q-1)+"'\n WHERE ID = " + itemId;
              db3.run(sqlcmd2);
              
              db3.close(); 

      });
  });
}
		 

function makeAccount(filename, res)
{
    console.log("asdfadsfasdf");
    var db = new sqlite.Database("StoreFront.sqlite");
    var info = filename.split("?")[1].split("&");
    var uname = info[0].split("=")[1];
    var pword = crypto.createHash('md5').update(info[1].split("=")[1]).digest('hex');
    var name = info[2].split("=")[1];
    var information = {name: name, uname:uname};
    console.log(name + information);
    var cart = {amount:0};
    console.log(cart.amount);
    var acctcart = JSON.stringify(cart);
    var sql_cmd = "INSERT INTO CUSTOMER ('USERNAME', 'PASSWORD', 'NAME', 'CART') VALUES ('"+uname+"', '"+pword+"', '"+
        name+"', '"+acctcart+"')";
    db.run( sql_cmd );
    db.close(function(){
        res.writeHead(200);
        res.end(JSON.stringify(information));
    });    
}

function login(filename, res)
{
    var db = new sqlite.Database("StoreFront.sqlite");
    var info = filename.split("?")[1].split("&");
    var unameExists = false;
    var result = {};
    console.log(info[0]);
    db.each("SELECT * FROM CUSTOMER WHERE USERNAME = '"+info[0]+"'", function(err,row){
        unameExists = true;
        console.log(row);
        if(row.PASSWORD == crypto.createHash('md5').update(info[1]).digest('hex')){
            res.writeHead(200);
            result.username = row.USERNAME;
            result.name = row.NAME;
            result.cartSize = row.CART.amount;
            res.end(JSON.stringify(result));
            console.log(row.CART.amount);
        }
        else{
            res.writeHead(200);
            res.end("");
        }
    });
    db.close(function(){if(!unameExists){
            res.writeHead(200);
            res.end("");
        }
    });

}

function makePayment(filename, req, res1){
  var price = filename.split("?")[1];
  console.log(price);
  var config_opts = {
      'host': 'api.sandbox.paypal.com',
      'port': '',
      'client_id': 'AQ8Wy_4bSqi9Vsiy2_sjqJaLZ4mnwRXsINy1yLSdy4ih6PMnZn5djjJu9RYYZUC3cZOF1E7KHHSJl_xE',
      'client_secret': 'EHr-bMZoEeT3n-2vfLGK5q0wC3XtWMb2UQAA7-7J2NaEaW5vWET-J4l_FhJWZIJPxh4ZFap9jUvyQSbE'
  };


  var create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "https:\/\/172.30.44.14:"+port+"\/paysuccess",
          "cancel_url": "https:\/\/172.30.44.14:"+port+"\/payfail"
      },
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": parseFloat(price).toFixed(2)
          },
          "description": "A bunch of video games."
      }]
  };


  paypal_api.payment.create(create_payment_json, config_opts, function (err, res) {
      if (err) {
          throw err;
      }

      if (res) {
          console.log("Create Payment Response");
          console.log(res);
          res1.writeHead(200);
          console.log(res.links[1].href);
          res1.end(JSON.stringify(res.links[1].href));
      }
  });  
}

function execOrder( filename, req, res1 )
{
    console.log("asdfasdf");
    var config_opts = {
        'payment_id': 'api.sandbox.paypal.com',
        'port': '',
        'client_id': 'AQ8Wy_4bSqi9Vsiy2_sjqJaLZ4mnwRXsINy1yLSdy4ih6PMnZn5djjJu9RYYZUC3cZOF1E7KHHSJl_xE',
        'client_secret': 'EHr-bMZoEeT3n-2vfLGK5q0wC3XtWMb2UQAA7-7J2NaEaW5vWET-J4l_FhJWZIJPxh4ZFap9jUvyQSbE'
    };
    var exec_payment_json = {
        "payer_id" : filename.split("?")[1].split("=")[3]
    };
    console.log (filename.split("?")[1].split("="));
    paypal_api.payment.execute(filename.split("?")[1].split("=")[1].split("&")[0], exec_payment_json, config_opts, function (err, res) {
      if (err){
          throw err;
      }
      if (res){
        console.log("Create Payment Response");
        console.log(res);
        paid = true;
        serveFile( "index.html", req, res1 );
      }
    });
}

function lookCart( filename, req, res )
{
    var db = new sqlite.Database("StoreFront.sqlite");
    var username = filename.split("?")[1];
    db.each("SELECT * FROM CUSTOMER WHERE USERNAME = '"+username+"'", function(err,row){
        res.writeHead(200);
        res.end(row.CART);
    });
}

function checkCheck( filename, req, res )
{
    console.log("asdfasdf");
    if(!paid){
        res.writeHead(200);
        res.end(JSON.stringify(false));
        return;
    }
    var db = new sqlite.Database("StoreFront.sqlite");
    var username = filename.split("?")[1];
    var emptycart = {amount:0};
    var sqlcmd = "UPDATE CUSTOMER \n SET CART='"+JSON.stringify(emptycart)+"'\n WHERE USERNAME = '" + username + "'";
    db.run(sqlcmd);
    paid = false;
    res.writeHead(200);
    res.end(JSON.stringify(true));
}

function serveFile( filename, req, res )
{
    var contents = "";
    try {
    	contents = fs.readFileSync( filename );
    }
    catch( e ) {
    	console.log(
    	    "Error: Something bad happened trying to open "+filename );
        res.writeHead( 404 );
        res.end( "" );
        return;
    }

    res.writeHead( 200 );
    res.end( contents );
}

function serverFn( req, res )
{
  
    var filename = req.url.substring( 1, req.url.length );
    if( filename == "storefrontclient.js" )
    {
        serveFile( "storefrontclient.js", req, res );
    }
    else if( filename == "storefront.css" )
    {
        serveFile( "storefront.css", req, res );
    }
    else if(filename == "featureditems")
    {
        fillTable(res);
    }
    else if(filename == "listitems")
    {
	     fillTable2(res);
    }
    else if( filename.substring(0,8) == "makeacct")
    {
        makeAccount(filename, res);
    }
    else if( filename.substring(0,5) == "login")
    {
        login(filename, res);
    }
    else if( filename.substring(filename.length-3, filename.length) == "jpg")
    {
        serveFile(filename, req, res);
    }
    else if(filename == "makeaccount.html")
    {
      serveFile( filename, req, res );
    }
    else if (filename == "catalogue.html")
    {
	     serveFile(filename, req, res);
    }
    else if (filename == "Cart.html")
    {
	      serveFile(filename, req, res);
    }
    else if (filename.substring(0,8) == "checkout")
    {
	      makePayment(filename, req, res);
    }
    else if (filename.substring(0,10) == "checkcheck")
    {
	      checkCheck(filename, req, res);
    }
    else if (filename.substring(0,8) == "showcart")
    {
	     addtocart(filename, req, res);
    }
    else if (filename.substring(0,10) == "paysuccess")
    {
        console.log("asdfasdf");
        execOrder(filename, req, res);
    }
    else if (filename.substring(0,7) == "payfail")
    {
        serveFile("Cart.html", req, res);
    }
    else if (filename.substring(0,8) == "lookcart")
    {
	     lookCart(filename, req, res);
    }
    else
    {
        serveFile( "index.html", req, res );
    }
}

var options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt')
};

var server = https.createServer( options, serverFn );

if( process.argv.length < 3 )
{
    var port = 8080;
}
else
{
    var port = parseInt( process.argv[2] );
}

server.listen( port );