var mongoose = require('mongoose');
//connect the database of mongo, add the mechanism reconnect
mongoose.connect('mongodb://localhost:27017/WebserviceData',{server:{auto_reconnect:true}});
//不使用mongoose的promise库因为性能不好，这里Promise库性能bluebird>原生>mongoose
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.once('open',()=>{
    console.log('Connection using Mongoose succeed!');
})
db.on('error',(error)=>{
    console.error('Error in MongoDB connection' + error);
    //reconnect may solve the error.
    mongoose.disconnect();
});

db.on('close', function() {
    console.log('Closed,reconnecting...');
    mongoose.connect('mongodb://localhost:27017/WebserviceData', {server:{auto_reconnect:true}});
});

exports.mongoose = mongoose;