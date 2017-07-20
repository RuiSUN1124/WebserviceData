var express = require('express');
var xml = require('xml');
var o2x = require('object-to-xml');
var js2xmlparser = require("js2xmlparser");
var jsontoxml = require('jsontoxml');
var json2xml = require('json2xml');
var router = express.Router();
var CarFlow = require('../models/Flow.js');
var EasyXml = require('easyxml');

router.use((req, res, next) => {
    console.log('Source IP: '+req.ip+' at '+ new Date().toString());
    next();
});

router.get('/', (req, res) => {
    res.set('Content-Type', 'text/xml');
    res.send(o2x({
        '?xml version="1.0" encoding="utf-8"?': null,
        Root: {
            "Status": 200
        }
    }));
});

router.get('/all', (req, res) => {
    CarFlow.findAll((err, obj) => {
        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});

router.get('/near', (req, res) => {
    CarFlow.findNear((err, obj) => {
        // console.log(obj);
        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});

router.get('/cross/:id', (req, res) => {
    CarFlow.findByCross(req.params.id, (err, obj) => {
        // console.log(obj);
        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});

router.get('/cross/:id/lane/:no', (req, res) => {
    CarFlow.findByCrossByLaneNo(req.params.id, req.params.no, (err, obj) => {
        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});

router.get('/start=:timestart&end=:timeend', (req, res) => {
    CarFlow.findByPeriod(req.params.timestart, req.params.timeend, (err, obj) => {
        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});

router.get('/cross/:id/start=:timestart&end=:timeend', (req, res) => {
    CarFlow.findByCrossByPeriod(req.params.id, req.params.timestart, req.params.timeend, (err, obj) => {
        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});

router.get('/cross/:id/lane/lanestart=:lanest&laneend=:laneen/start=:timestart&end=:timeend', (req, res) => {
    CarFlow.findByCrossByLaneRangeByPeriod(req.params.id, req.params.lanest, req.params.laneen, req.params.timestart, req.params.timeend, (err, obj) => {
        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});

router.get('/cross/:id/last3min', (req, res) => {
    CarFlow.findByCrossNear3min(req.params.id, (err, obj) => {

        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});

router.get('/last/:n',(req,res) => {
    CarFlow.findLastN(req.params.n,(err,obj)=>{
        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});


router.get('/cross/:id/lane/:no/last/:n',(req,res) => {
    CarFlow.findByCrossByLaneLastN(req.params.id,req.params.no,req.params.n,(err,obj)=>{
        var data_xml = jsontoxml(obj);
        res.set('Content-Type', 'text/xml');
        var d = '<?xml version="1.0" encoding="utf-8"?>';
        res.send(d + data_xml);
    });
});
module.exports = router;