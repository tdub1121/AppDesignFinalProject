var fs = require( "fs" );
var http = require( "http" );
var sqlite = require( "sqlite3" );

function fillTable(res)
{
    var db = new sqlite.Database("StoreFront.sqlite");
    var rows = {};
    rows.length = 0;

    db.each("SELECT * FROM ITEM WHERE ID = 1 OR ID = 2 OR ID = 3", function(err,row){
        rows[row.ID] = row;
        console.log(row);
	rows.length++;
    });        
    db.close(function(){
        console.log(rows);
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
        console.log(row);
	rows.length++;
    });        
    db.close(function(){
        console.log(rows);
	res.writeHead(200);
	res.end(JSON.stringify(rows));
    });
}

function makeAccount(filename, res)
{
    console.log("asdfadsfasdf");
    var db = new sqlite.Database("StoreFront.sqlite");
    var info = filename.split("?")[1].split("&");
    var name = info[0].split("=")[1];
    var addr = info[1].split("=")[1];
    var phone = info[2].split("=")[1];
    var card = info[3].split("=")[1];
    var information = {address:addr, phone:phone, card:card};
    console.log(name + information);
    res.writeHead(200);
    res.end("");
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
    else if( filename.substring(0,7) == "makeacct")
    {
        makeAccount(filename, res);
        console.log("asdfasdf");
    }
    else if( filename.substring(filename.length-3, filename.length) == "jpg")
    {
        serveFile(filename, req, res);
        console.log(filename);
    }
    else if(filename == "makeaccount.html")
    {
      serveFile( filename, req, res );
    }
    else if (filename == "catalogue.html")
    {
	serveFile(filename, req, res);
    }
    else
    {
        serveFile( "index.html", req, res );
    }
}

var server = http.createServer( serverFn );

if( process.argv.length < 3 )
{
    var port = 8080;
}
else
{
    var port = parseInt( process.argv[2] );
}

server.listen( port );
