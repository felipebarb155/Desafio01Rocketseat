const { response, request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");


const app = express();
const cors = require("cors");
app.use(cors())
app.use(express.json());

const users = [];

function verifyIfExistsAccountUsername (request, response, next){
    const {username} = request.headers;

    const user = users.find( developer => developer.username === username);

    if(!user){
        return response.status(400).json({error: "Developer not found"});
    }

    request.user = user;

    return next();
}

app.post("/users", (request, response) => {
    const {username, name} = request.body;

    const customerAlreadyExists = users.some( 
        (user) => user.username === username
    );
    
    if (customerAlreadyExists){
        return response.status(400).json({ error:"Username already exists!!!"});
    }

    const user = { 
        name,
        username,
        id: uuidv4(),
        todos: []
    }
    users.push(user);

    return response.status(201).json(user);
});

app.get("/todos", verifyIfExistsAccountUsername, (request, response) =>{
    const { user} = request;
    return response.json(user.todos)
});

app.post("/todos", verifyIfExistsAccountUsername, (request, response) => {

    const {title, deadline} = request.body;

    const {user} = request;

    const todosOperation = {
        id: uuidv4(),
        title: title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()

    }
    user.todos.push(todosOperation);

    return response.status(201).json(todosOperation);
});

app.put("/todos/:id", verifyIfExistsAccountUsername, (request, response) => {
    const {user} = request;
    const {title, deadline} = request.body;
    const {id} = request.params;
    const verifyid = user.todos.findIndex( (todo) => todo.id === id );

    if(verifyid === -1){
        return response.status(404).json({ error:"todo not found"});
    }
    user.todos[verifyid].title = title;
    user.todos[verifyid].deadline = new Date (deadline);
   
    return response.status(201).json(user.todos[verifyid]);

});

app.patch("/todos/:id/done", verifyIfExistsAccountUsername, (request, response) => {
    const { user} = request;
    const {id} = request.params;

    const verifyid = user.todos.findIndex( (todo) => todo.id === id );

    if(verifyid === -1){
        return response.status(404).json({ error:"todo not found"});
    }

    user.todos[verifyid].done = true;

    return response.status(201).json(user.todos[verifyid]);
    
});


app.delete("/todos/:id", verifyIfExistsAccountUsername, (request, response) => {
    const {user} = request;
    const {id} = request.params;
    
    const verifyid = user.todos.find( (todo) => todo.id === id );

    if(!verifyid){
        return response.status(404).json({ error:"todo not found"});
    }
    
    //splise

    user.todos.splice(verifyid,1);

    return response.status(204).send();

});






module.exports = app;