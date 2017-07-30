//2016-6-13
//每一帧可能有多个包，每个帧有且只有一个13bytes的head
// CrossID 	: 31 32 33 34 35 36 37 38    	     共 8byte
// 	PacketType	: 01                          	  	1byte
// 	PacketInfo	: 01 00 00 00 				4byte
//  每个帧有且只有一个检错1byte和生产商编码1byte的尾

//以上： a socket contains 15 + n*59 bytes 

var net = require('net');
var CarFlow = require('./models/Flow.js');
var server = net.createServer();
var num_socket = 0;
var num_packet = 0;
var data_rcv_length = 0;
var num_correct = false;
var data;
var length_will_rcv = 0;
var length_is_rcv = 0;
var counter_suc = 0;
var counter_fai = 0;
server.on('error', (err) => {
    console.log(err);
});
server.on('connection', (socket) => {
    //socket.setNoDelay(true);
    num_socket++;
    console.log('New socket connected: ' + num_socket + '\'s socket');
    socket.on('error', function (exc) {
        console.log("ignoring exception: " + exc + ' at' + new Date().toString());
    });
    socket.on('data', (data_rcv) => {
        var is_header = true;
        for (var i = 0; i <= 7; i++) {
            if (data_rcv[i] >= 58 || data_rcv[i] <= 47) is_header = false;
        }
        console.log('========================Receive==================================')
        console.log("Data received: " + data_rcv.length);
        console.log((is_header) ? 'A frame WITH header!' : 'A frame WITHOUT header!');
        if (is_header) {
            length_will_rcv = data_rcv[9] * 59 + 15;
            console.log("Supposed packet length is " + length_will_rcv);
            // DateTime
            // var suppose_date_time = new String();
            // for (var i = 19; i < 38; i++) {
            //   suppose_date_time = suppose_date_time + String.fromCharCode(data[i]);
            // }
            // console.log(suppose_date_time);

            length_is_rcv = 0;
            length_is_rcv = data_rcv.length;
            data = new Buffer(0);
            data = Buffer.concat([data, data_rcv]);
            if (length_is_rcv == length_will_rcv) {
                console.log("Already a complete packet, store process...");
                handle_data(data, socket);
            }

        } else {
            if (data == null) {
                data = new Buffer(0);
            }
            data = Buffer.concat([data, data_rcv]);
            if (data.length > 2000) {
                //   data = new Buffer(0);
                //  length_is_rcv = 0;
                //  length_will_rcv = 0;
                console.log("Beyond the max data! Reset and wait new header...");
            }
            if (data.length == length_will_rcv) {
                console.log("receive a packet completely! store process...");
                handle_data(data, socket);
            }
        }
    });
});

server.listen(4001);
console.log('Server started,listening port 4001:...');

var handle_data = function (data, socket) {
    console.log('data8:  '+data[8]);
    var data_length = data.length;
    if ((data_length - 15) % 59 != 0) {
        console.log('Received ', data_length, ' bytes data');
        console.log('Number of array byte incorrect, please resend!');
        num_correct = false;
    } else {
        console.log('Received ', data_length, ' bytes data successfully');
        num_packet = (data_length - 15) / 59;
        num_correct = true;
    }

    //var ManufacturerCode	    
    var manu_code = data[data_length - 2];
    //console.log('-ManufacturerCode: ' + manu_code);

    //var CheckCode
    var check_code = data[data_length - 1];
    //console.log('-CheckCode: ' + check_code);

    //check 
    var check_correct = data[13];
    for (var i = 14; i <= data_length - 3; i++) {
        check_correct ^= data[i];
    }

    //console.log('Check result: ', check_correct);
    console.log('Check succeed: ', (check_code == check_correct) ? 'Yes' : 'No, resend please!');


    //verifier if the data is for asychronous time without data storing
    if (data[8] == 128) {
        Res_time(data, socket);
    }

    if (data[8] == 129) {
        Store_data(data, socket);
    }
    //test bytes stream,check every byte

    if ((check_code == check_correct) && num_correct && (data[8] == 1)) {

        // data.forEach((d, index) => {
        //     console.log(index + '\'s value is ' + d);
        // });
        //Packet data
        Store_data(data, socket);

    }
}

var Res_time = function (data, socket) {
    //console.log(data[8]);
    var buf_packetInfo = new Buffer(4);
    for (var i = 0; i <= 3; i++) {
        buf_packetInfo[i] = data[i + 9];
    }
    var buf_crossid = new Buffer(8);
    for (var i = 0; i <= 7; i++) {
        buf_crossid[i] = data[i];
    }
    var buf_packet_type = new Buffer(1);
    buf_packet_type[0] = data[8];

    var buf_time = new Buffer(4);

    buf_packetInfo.writeUIntLE(0x2, 0, 4);
    var timestamp = Math.round(new Date().getTime() / 1000)
    var buf_tt = new Buffer(4);
    buf_tt.writeInt32BE(timestamp, 0, 4);
    console.log(timestamp);
    var res_sec = Buffer.concat([buf_crossid, buf_packet_type, buf_packetInfo, buf_tt]);
    socket.write(res_sec);
}

var Res_data = function (data, socket) {
    var buf_packetInfo = new Buffer(4);
    for (var i = 0; i <= 3; i++) {
        buf_packetInfo[i] = data[i + 9];
    }
    var buf_crossid = new Buffer(8);
    for (var i = 0; i <= 7; i++) {
        buf_crossid[i] = data[i];
    }
    var buf_packet_type = new Buffer(1);
    buf_packet_type[0] = data[8];

    buf_packetInfo.writeUIntLE(0x2, 0, 4);

    var res_sec = Buffer.concat([buf_crossid, buf_packet_type, buf_packetInfo]);
    socket.write(res_sec);
}

var Store_data = function (data, socket) {
    for (var k = 0; k < num_packet; k++) {
        //var CrossID
        var str_crossid = new String();
        for (var i = 0; i < 8; i++) {
            str_crossid = str_crossid + String.fromCharCode(data[i]);
        }
        var buf_crossid = new Buffer(8);
        for (var i = 0; i <= 7; i++) {
            buf_crossid[i] = data[i];
        }

        var buf_packet_type = new Buffer(1);
        buf_packet_type[0] = data[8];

        var buf_packetInfo = new Buffer(4);
        for (var i = 0; i <= 3; i++) {
            buf_packetInfo[i] = data[i + 9];
        }


        //var DeviceType
        var device_type = new String();
        device_type = String.fromCharCode(data[13 + 59 * k]);

        //var DateTime
        var str_date_time = new String();
        for (var i = 19 + 59 * k; i < 38 + 59 * k; i++) {
            str_date_time = str_date_time + String.fromCharCode(data[i]);
        }
        var date_time = new Date(str_date_time);

        //Interval
        // Primer method: var interval = data[14 + 59*k]+data[15 + 59*k]*256; It's Okay.    
        var buf_interval = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_interval[i] = data[14 + 59 * k + i];
        }

        //var LaneNo
        var lane_no = new String();
        for (var i = 16 + 59 * k; i < 19 + 59 * k; i++) {
            lane_no = lane_no + String.fromCharCode(data[i])
        }
        //var Volume
        var buf_v = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_v[i] = data[39 + 59 * k + i];
        }

        //var AveOccupancy
        var buf_ave_occup = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_ave_occup[i] = data[51 + 59 * k + i];
        }

        //var AveHeaderTime
        var buf_ave_header = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_ave_header[i] = data[53 + 59 * k + i];
        }
        //var Avelength
        var buf_avg_l = new Buffer(4);
        for (var i = 0; i <= 3; i++) {
            buf_avg_l[i] = data[55 + 59 * k + i];
        }

        //var  AveSpeed
        var buf_avg_s = new Buffer(4);
        for (var i = 0; i <= 3; i++) {
            buf_avg_s[i] = data[59 + 59 * k + i];
        }
        //var Saturation
        var saturation = data[63 + 59 * k];

        //var Density
        var buf_den = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_den[i] = data[64 + 59 * k + i];
        }

        //var Pcu
        var buf_pcu = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_pcu[i] = data[66 + 59 * k + i];
        }

        //var AvgQueueLength
        var buf_ave_ql = new Buffer(4);
        for (var i = 0; i <= 3; i++) {
            buf_ave_ql[i] = data[68 + 59 * k + i];
        }

        //var Volume1                    
        var buf_v1 = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_v1[i] = data[41 + 59 * k + i];
        }

        //var Volume2
        var buf_v2 = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_v2[i] = data[43 + 59 * k + i];
        }

        //var Volume3
        var buf_v3 = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_v3[i] = data[45 + 59 * k + i];
        }

        //var Volume4
        var buf_v4 = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_v4[i] = data[47 + 59 * k + i];
        }

        //var Volume5
        var buf_v5 = new Buffer(2);
        for (var i = 0; i <= 1; i++) {
            buf_v5[i] = data[49 + 59 * k + i];
        }

        // console.log('========================  Header  ===========================');
        // console.log('-Cross ID: ', str_crossid);
        // console.log('-Device Type: ', device_type);
        // console.log('-Date Time(ISO standard)：', date_time.toString());
        // console.log(' Date Time(String): ', str_date_time);
        // console.log('-interval: ' + buf_interval.readUInt16LE(0));

        // console.log('==================Packet ' + k + ' Data ' + '======================');            
        // console.log('-Lane Nomber: ', lane_no);
        // console.log('-Volume: ' + buf_v.readUInt16LE(0));
        // console.log('-AveOccupany: ' + buf_ave_occup.readUInt16LE(0));
        // console.log('-AveHeaderTime: ' + buf_ave_header.readUInt16LE(0));
        // console.log('-AveLength: ' + buf_avg_l.readFloatLE(0));

        // console.log('-AveSpeed: ' + buf_avg_s.readFloatLE(0));
        // console.log('-Saturation: ', saturation);
        // console.log('-Density: ' + buf_den.readUInt16LE(0));
        // console.log('-PCU: ' + buf_pcu.readUInt16LE(0));
        // console.log('-AveQueueLength: ' + buf_ave_ql.readFloatLE(0));
        // console.log('-Volume1: ' + buf_v1.readUInt16LE(0));
        // console.log('-Volume2: ' + buf_v2.readUInt16LE(0));
        // console.log('-Volume3: ' + buf_v3.readUInt16LE(0));
        // console.log('-Volume4: ' + buf_v4.readUInt16LE(0));
        // console.log('-Volume5: ' + buf_v5.readUInt16LE(0));
        // console.log('==================Packet ' + k + ' Data Fini' + '==================');

        var packet_json = {
            CrossTrafficData: {
                CrossID: str_crossid,
                DeviceType: device_type,
                DateTime: str_date_time,
                Interval: buf_interval.readUInt16LE(0),
                DataList: {
                    Data: {
                        LaneNo: lane_no,
                        Volume: buf_v.readUInt16LE(0),
                        AvgOccupancy: buf_ave_occup.readUInt16LE(0),
                        AvgHeadTime: buf_ave_header.readUInt16LE(0),
                        AvgLength: buf_avg_l.readFloatLE(0).toFixed(2),
                        AvgSpeed: buf_avg_s.readFloatLE(0).toFixed(2),
                        Saturation: saturation,
                        Density: buf_den.readUInt16LE(0),
                        Pcu: buf_pcu.readUInt16LE(0),
                        AveQueueLength: buf_ave_ql.readFloatLE(0).toFixed(2),
                        Volume1: buf_v1.readUInt16LE(0),
                        Volume2: buf_v2.readUInt16LE(0),
                        Volume3: buf_v3.readUInt16LE(0),
                        Volume4: buf_v4.readUInt16LE(0),
                        Volume5: buf_v5.readUInt16LE(0)
                    }
                }
            }
        };
        //因为是异步，所以save succeed出现在check succeed后面，Num_packet就是用来确定一个帧发送多个内容相同的包，
        //收到的是多个不同的包而不是一个包收多次。 这么做是测试客户端的缺陷（发多包只能内容一样的）。
        CarFlow.save(packet_json, (err) => {
            if (err) {
                console.error(err);
                //  console.log('save failed')
                counter_fai++;
            } else {
                //console.log('save succeed');
                counter_suc++;
                // socket.resume();
            }
            if ((counter_fai + counter_suc) == num_packet) {
                console.log('Save succeed ' + counter_suc + ' documents\nSave failed ' + counter_fai + ' documents');
                console.log(new Date().toString());
                console.log('num_packet '+num_packet);
                if (counter_suc == num_packet) {
                    if (data[8] == 129) {
                        console.log('Respond a header with time');
                        Res_time(data, socket);
                    } else if (data[8] == 1) {
                        console.log('Respond a header without time');                        
                        Res_data(data, socket);
                    }
                }
                counter_fai = 0;
                counter_suc = 0;
                console.log('================================================================')
                console.log('\n')
            }
        });
    }
}
