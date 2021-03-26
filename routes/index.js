// Create an instance of the Express Router to be used as middleware for our routes.
const express = require('express'); 
const jwt = require('./lib/jwtUtils');

const router = express.Router(); 

// Make the router refresh the JWT for all endpoints
// TODO: make JWT functions asynchronous so this does not bog down the server
router.use(function(req, res, next) {
    // Do not try to refresh a token when dealing with endpoints that do not require authorization
    // Probably better to create two routers: one for authenticated actions and the other for others
    if (req.path.startsWith('/register') || req.path.startsWith('/login')) {
        next();
        return;
    }

    // Exclusions for unauthenticated pages
    if (req.path.includes("/forgotPassword")) {
        next();
        return;
    }

    if (req.cookies && req.cookies.token) {
        const success = jwt.refreshJWT(req.cookies.token, res);

        if (!success) {
            res.status(401).json({ error: "The passed authenticaton token is invalid" });
            return;
        }

    } else {
        res.status(401).json({ error: "You must be logged in to perform this action" });
        return;
    }

    next();
});

// Import api endpoints
const apiEndpoints = {
    login: require('./login'),
    register: require('./register'),
    account: require('./account')
}

// Pass the router to the endpoints, allowing them to use it
for (var endpoint in apiEndpoints) {
    apiEndpoints[endpoint].use(router);
}

// Export the router object
module.exports = router;


// Article endpoints are left below but disabled
// They are just sort of templates for CRUD operations
/* 
// Import the Article model. For each API endpoint we will chain a method to the router object. 
// The format is: router.HTTP Method(path, handler function)
// We imported the Article model representing the articles collection in our database.
// We chain methods from the mongoose library to the Article prototype that will
// perform different types of CRUD actions. Our handler functions perform the CRUD
// operation and may return a response. Generally only return responses that will be used by the client.
const Article = require('../models/article'); 

// Get request to /articles returns a JSON array of all article objects found in the database.
router.get('/articles', function(req, res) { 
    Article.find(function(err, articles) {
        res.json(articles);
    });
});

// Get request to /articles/:id (:id is a variable representing an article's _id)
// returns a JSON object of the specified article if it exists, otherwise returns
// status 404 and "No result found"
router.get('/articles/:id', function(req, res) {  
    Article.findById(req.params.id, function(err, article) {
        if (!article) {
            res.status(404).send('No result found');
        } else {
            res.json(article);
        }
    });
});

// Post request to /articles creates a new Article instance from the JSON object
// in sent in the HTTP request body and saves it to the database. If successful
// a status 200 code is automatically returned. We'll add on to that a JSON response
// with the new article object we just added which includes the article _id generated by the database.
router.post('/articles', function(req, res) {
    let article = new Article(req.body);
    article.save()
    .then(article => {
        res.send(article);
    })
    .catch(function(err) {
        res.status(422).send('Article add failed');
    });
});

// Patch request to /articles/:id updates the specified article with the JSON object
// sent in the HTTP request body. You could use the PATCH, PUT or POST HTTP methods
// since they all send a payload. It's the handler function that determines what is
// done with the payload. On a successful update we are returning a JSON response just 
// stating "Article updated". If the article did not update then we send
// an Unprocessable Entity code 422 response with a message.
router.patch('/articles/:id', function(req, res){
    Article.findByIdAndUpdate(req.params.id, req.body)
    .then(function() {
        res.json('Article updated');
    })
    .catch(function(err) {
        res.status(422).send("Article update failed.");
    });
});

// Delete request to /articles/:id first checks if the article exists.
// If so it deletes it and sends status 200 with a JSON response of "Article deleted".
router.delete('/articles/:id', function(req, res) {  
    Article.findById(req.params.id, function(err, article) {
        if (!article) {
            res.status(404).send('Article not found');
        } else {
            Article.findByIdAndRemove(req.params.id)
            .then(function() { res.status(200).json("Article deleted") })
            .catch(function(err) {
                res.status(400).send("Article delete failed.");
            })
        }
    });
})

*/ 

