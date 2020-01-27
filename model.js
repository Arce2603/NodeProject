let mongoose = require('mongoose');

mongoose.Promise = global.Promise;  //es para utilizar promesas como cuando usabamos fetch
//cuando solicitamos informacion, espera. Cuando llega la info, continuamos con lo que teniamos que hacer

let studentCollection = mongoose.Schema({
    nombre: { type: String },
    apellido: { type: String },
    matricula: {
        type: Number,
        required: true,
        unique: true
    }
});

/*esta variable es la que tiene la conexion a la base de datos.
 * Todos los queries se van a hacer a traves de esta variable */
let Student = mongoose.model('students', studentCollection); //es el nobre que se uso en Mongo

/*Esta variable tiene todos los queries que podemos hacer*/
let StudentList = {
    getAll: function () {

        return Student.find()
            .then(students => {  ///students es un arreglo que nos arrojo la base de datos
                return students; //esto nos lo regresa a donde se llamo el getAll(), ene ste caso el index
            })
            .catch(error => {
                throw Error(error)
            });
    },
    getById: function (id) {
        return Student.findOne({ 'matricula': id })
            .then(student => {  
                return student; 
            })
            .catch(error => {
                throw Error(error)
            });
    }
    //addStudent: function (stdnt) {
    //    return Student.create(stdnt)
    //}
};

module.exports = {
    StudentList
};

