'use strict'
var mongodb = require('./mongodb');
var Schema =  mongodb.mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var GateSchema = new Schema({
    gateId: String,
    type: String,
    location: {xPoint: Double,
               yPoint: Double },
    //userAdmin: {type: String,default:'Admin'},//this function repetitive?
    idGate: String,//Normal: 1 Super: 2
	//avatar: {type: String, default: 'default.jpg'},
    setTime: String,
    roadName: String
});
GateSchema.plugin(passportLocalMongoose);
//collection name
var GateModel = mongodb.mongoose.model('gate',GateSchema);

//operations
var UserOp = function(){};
//function save
UserOp.prototype.save = function(obj,callback){
    var instance = new GateModel(obj);
    instance.save(function(err){
        callback(err);
    })
}

exports.UserOp = new UserOp();
exports.GateModel = GateModel;