let express = require('express'); //se requiere correr previamente el npm install express
let morgan = require('morgan');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let jsonParser = bodyParser.json();
let app = express();  //nos permite que appp tenga todas las caracteristicas de express
let { StudentList } = require('./model'); //es el que estamos exportando al final en el model.js

app.use(express.static('public'));
app.use(morgan('dev'));  //mode desarrollador


//Es para habilitar los CORS y permitir que otras personas accedan al servidor
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    if (req.method === "OPTIONS") {
        return res.send(204);
    }
    next(); //aqui se puede evitar el next(),  
    //se usa cuando en lugar de app.use haces una funcion como middleware
});

let estudiantes = [
    { nombre: "Miguel", apellido:"Angeles", matricula:1730939},
    { nombre: "Erick", apellido: "Gonzalez", matricula:1265478},
    { nombre: "Victor", apellido: "Villarreal", matricula: 1669543 },
    { nombre: "Victor", apellido: "Cardenas", matricula: 1829730 }
    ];

//Endoint #1 GET the todos los estudiantes
app.get('/api/students', (req, res) => {  //especifica un endpoint tipo get(url, middleWare (opcionall), func anonima)
    StudentList.getAll()
        .then(studentList => {
            return res.status(200).json(studentList);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "Error de conexión con la BD";
            return res.status(500).send();
        });
    /*Antes solo era un return res.status(200).json(estudiantes);*/
});  

//Endpoint #2  Los parametros se obtienen de la forma  'url/param1=valor&param2=valor
app.get('/api/getById', (req, res) => {
    //console.log(req.query);   //nos muestra los parametros que se pusieron en el url
    let id = req.query.id;
 /*   let result = estudiantes.find((elemento)=> {  //tambien se puede hacer un FOR
        if (elemento.matricula == id) {
            return elemento;
        }
    });*/
    StudentList.getById(id)
        .then(result => {
            if (result) {
                console.log("ee");
                return res.status(200).json(result);
            }
            else {
                res.statusMessage = 'Student not found';
                return res.status(404).send();
            }
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "Error de conexión con la BD";
            return res.status(500).send();
        });

});

//Endpoint #3  Pero los parametros se obtienen de otra manera   'url/paramVal1/paramVal2
app.get('/api/getByName/:name', (req, res) => {
    let name = req.params.name;   //se usa params
    let result = estudiantes.filter((elemento) => {  //tambien se puede hacer un FOR
        if (elemento.nombre === name) {
            return elemento;
        }
    });
    if (result.length>0)
        return res.status(200).json(result);
    else {
        res.statusMessage = 'Student not found';
        return res.status(404).send();
        //de lo contrario se sigue ejecutando el código de abajo y causaria problemas
    }
});

//Endpoint #4 (post)
app.post('/api/newStudent', jsonParser, (req, res) => {
    let apellido = req.body.apellido;
    let nombre = req.body.nombre;
    let matricula = req.body.matricula;
    if (apellido && apellido !== ''
        && nombre && nombre !== ''
        && matricula && matricula !== '') {
        let exist = estudiantes.find((elemento) => {
            if (elemento.matricula == matricula) {
                return true;
            }
        });
        if (!exist) {
            estudiantes.push(req.body);
            console.log(estudiantes);
            return res.status(201).json({});
        }
        else {
            res.statusMessage = 'Matricula ya existente'
            return res.status(406).send();
        }
    }
    else {
        res.statusMessage = 'Falta un campo'
        return res.status(406).send();
    }
});

//Endpoint #5 (put)
app.put('/api/updateStudent/:id', jsonParser, (req, res) => {
    let apellido = req.body.apellido;
    let nombre = req.body.nombre;
    let matricula = req.body.matricula;
    let id = req.params.id;
    let objSend = {};
    if (((apellido && apellido !== '') || (nombre && nombre !== ''))
        && matricula && matricula !== '') {
        if (id == matricula) {
            let exist = estudiantes.find((elemento) => {
                if (elemento.matricula == matricula) {
                    if (apellido && apellido !== '') 
                        elemento.apellido = apellido;
                    if (nombre && nombre !== '')
                        elemento.nombre = nombre;
                    objSend = elemento;
                    return true;
                }
            });
            if (!exist) {
                res.statusMessage = 'Matricula no existente';
                return res.status(404).send();
            }
            else {
                console.log(objSend);
                return res.status(202).json(objSend);
            }
        }
        else {
            res.statusMessage = 'Matricula no coincide';
            return res.status(409).send();
        }
    }
    else {
        console.log(req.body);
        res.statusMessage = 'Faltan campos apellido o nombre';
        return res.status(406).send();
    }
});

//Endpoint #6 (delete)


//conectarse con BD
let server;

//run server es similar al listen, pero esto hace la conexion
function runServer(port, databaseUrl) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, response => {
            //se regresa response vacio si fue existoso
            //por eso se da reject si tiene definido un valor
            if (response) {
                return reject(response);
            }
            else {
                server = app.listen(port, () => {
                    console.log("App is running on port " + port);
                    resolve();
                })
                    .on('error', err => {
                        mongoose.disconnect();
                        return reject(err);
                    })
            }
        });
    });
}

function closeServer() {
    return mongoose.disconnect()
        .then(() => {
            return new Promise((resolve, reject) => {
                console.log('Closing the server');
                server.close(err => {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
}

runServer(8080, "mongodb://localhost/University");

//exporta para que se puedan utilizar
module.exports = { app, runServer, closeServer };

//Antes (para conexion local)
//app.listen(8080, () => {  //requiere dos parametros (#dePuerto, funcion anónima que se ejecutara)
//    console.log("servidor en 8080")
//}); 
