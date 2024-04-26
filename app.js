const fs = require('fs');
const http = require('http');
const url = require('url');
const { MongoClient } = require('mongodb');

var port = process.env.PORT || 3000;
http.createServer(async function (req, res) {
    if (req.url === '/') {
        fs.readFile('index.html', 'utf8', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        })
    } else if (req.url.startsWith('/process') && req.method === 'GET') {
        const query = url.parse(req.url, true).query;
        const input = query.searchTerm;
        const type = query.searchType;

        const uri = 'mongodb+srv://keiji_numataTUFTS:NFycyb510@products.dst7yi5.mongodb.net/?retryWrites=true&w=majority&appName=products';
        const client = new MongoClient(uri);

        var collection = null;

        try {
            await client.connect();
            const database = client.db('Stock');
            collection = database.collection('PublicCompanies');

            var companies; 

            let query = {};

            if (type === 'company') {
                query = { name: input };
            } else if (type === 'ticker') {
                query = { ticker: input };
            }
            companies = await collection.find(query).toArray();

            res.writeHead(200, { 'Content-Type': 'text/html' });
            let html = '<h2>Results:</h2>';
            
            companies.forEach(company => {
                console.log("Name: " + company.name + " Ticker: " + company.ticker + " Price: " + company.price + "\n");
                html+= `<p>Name: ${company.name} Ticker: ${company.ticker} Price: ${company.price}`;
            });
            res.end(html);

            await client.close();
        } catch (err) {
            console.error('Error:', err);
        }
    }
}).listen(port, () => {
    console.log(`Server started on port ${port}`);
});
