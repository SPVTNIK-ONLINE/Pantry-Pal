// Import the user model
const User = require('../models/user'); 

// Import libraries for handling hashed passwords and google authentication
const bcryptUtil = require('./lib/bcryptUtil');
const googleOAuth = require('./lib/googleOAuth');

// The root path of this, which is concatenated to the router path
// In the current version, this is /api/register
const endpointPath = '/register';

// Function to concatenate the paths, in the event that this should become
// more complicated to avoid having to rewrite in a lot of spots
// This should probably be moved to a library folder but I'll hold off for now
function constructPath(pathRoot, path) {
    return pathRoot + path;
}

// =================================================================================
// Local registration functions

// Validation function for local registration request bodies
// Could very likely be boiled down/condensed into regex checks
async function verifyLocal(body, res)
{
    // Content existence checks
    // No body sent
    if (!body) {
        res.json({ error: "No body included in request" });
        return false;
    }

    // No name sent
    if (!body.name) {
        res.json({ error: "No name included in request" });
        return false;
    }

    // No password sent
    if (!body.password) {
        res.json({ error: "No password included in request" });
        return false;
    }

    // No email sent
    if (!body.email) {
        res.json({ error: "No email included in request" });
        return false;
    }

    // Content validation checks
    // Name checks
    // TODO: maybe sanitize the name input. Also could move a lot of magic numbers
    // to a configuration/.env file
    if (body.name.length == 0 || body.name.length > 32) {
        res.json({ error: "Display name must be between 1 and 32 characters" });
        return false;
    }

    if (typeof(body.name) != "string") {
        res.json({ error: "Display name must be a string" });
        return false;
    }

    // ... and so on and so on. This is very taxing on space and is seemigly a bad way
    // of handling this, so I will stop here

    return true;
}

// Callback function for local registration,called from the encryptPassword
// function. It saves the user to the database and will begin the login
// flow, as well as trigger sending a verification email.
async function registerLocal(error, body, res, hashword)
{
    // If an error occured during password encryption, display an error
    if (error != null)
        res.json({ error: error });

    // Attempt to save registered user
    let user = new User({
        display: body.name,
        email: body.email,
        password: hashword
    });

    user.save()
    .then(user => {
        // If we get here, then the user was successfully registered
        // Now, the user has to be sent a verification email

        // Currently sends the user object as output, but this should be
        // changed to some sort of authentication token
        res.send(user);
    })
    .catch(function(err) {
        // Sends the error as output. If there is no ._message attribute, then
        // the error has to do with duplicate emails.
        res.status(422).json({ error: err._message || "Duplicate email" });
    });
}

// =================================================================================
// Google registration functions

// Validation function for local registration request bodies
// Checks existence of and authenticity of the token passed
async function verifyGoogle(body, res)
{
    if (!body.token) {
        res.json({ error: "No OAuth token included in request" });
        return { isValid: false };
    }

    const ticket = await googleOAuth.getTicket(body.token).catch(function(err) {
        res.json({ error: "Failed to validate authenticity of OAuth token" });
    });

    if (!ticket)
        return { isValid: false };

    return { isValid: true, ticket: ticket };
}

// Google registration function that attempts to add a user to the database
// Takes a Google Login Ticket and generates a user from it
async function registerGoogle(res, ticket)
{
    const { name, email, picture } = ticket.getPayload();

    if (!name || !email || !picture)
    {
        res.json({ error: "Failed to extract data from Google Login Ticket" });
        return;
    }

    // Attempt to save registered user
    let user = new User({
        display: name,
        email: email,
        avatar: picture,
        google: true
    });

    user.save()
    .then(user => {
        // If we get here, then the user was successfully registered
        // Now, the user has to be sent a verification email

        // Currently sends the user object as output, but this should be
        // changed to some sort of authentication token
        res.send(user);
    })
    .catch(function(err) {
        // Sends the error as output. If there is no ._message attribute, then
        // the error has to do with duplicate emails.

        // Forward this registration attempt to login (as it can be a simple mistake)
        // to press the register w/ Google button vs the login with Google button

        res.status(422).json({ error: err._message || "Already registered using Google" });
    });
}

// =================================================================================
// Router control

function use(router) {
    // This could be split into multiple functions, if wanted for readability
    router.post(constructPath(endpointPath, '/'), async function(req, res) {
        // Verify neccessary information is provided
        // Also checks that the information provided meets requirements
        let isValid = await verifyLocal(req.body, res);
        if (!isValid)
            return;

        // Begin registration process
        await bcryptUtil.encryptPassword(req.body, registerLocal, res);
    });

    router.post(constructPath(endpointPath, '/google'), async function(req, res) {
        // Verify necessary information is provided
        let { isValid, ticket } = await verifyGoogle(req.body, res);
        if (!isValid)
            return;

        // Begin registration process
        await registerGoogle(res, ticket);
    });
}

// Exported object that enables the use of functions defined here in other files
// Currently, only the `use` function is relevant to be used in external files
// If anyone wants to do this another way please do because something about this
// does not feel 'correct' to me
const register = {
    use: use
}

// Export the register object containing the use function
module.exports = register;