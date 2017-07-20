'use strict'
var mongodb = require('./mongodb');
var Schema =  mongodb.mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var DeviceSchema = new Schema({
    deviceId: String,
    type: String,
    location: {xPoint: Double,
               yPoint: Double },
    //userAdmin: {type: String,default:'Admin'},//this function repetitive?
    idGate: String,//Normal: 1 Super: 2
	//avatar: {type: String, default: 'default.jpg'},
    setTime: String,
    roadName: String
});
DeviceSchema.plugin(passportLocalMongoose);
//collection name
var DeviceModel = mongodb.mongoose.model('device',DeviceSchema);

//operations
var UserOp = function(){};
//function save
UserOp.prototype.save = function(obj,callback){
    var instance = new DeviceModel(obj);
    instance.save(function(err){
        callback(err);
    })
}

exports.UserOp = new UserOp();
exports.DeviceModel = DeviceModel;