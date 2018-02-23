/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var should = require("should");

var switchNode = require("../../../../nodes/core/logic/10-switch.js");
var helper = require("../../helper.js");
var RED = require("../../../../red/red.js");

describe('switch Node', function() {

    beforeEach(function(done) {
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload();
        helper.stopServer(done);
        RED.settings.nodeMessageBufferMaxLength = 0;
    });

    it('should be loaded with some defaults', function(done) {
        var flow = [{"id":"switchNode1","type":"switch","name":"switchNode"}];
        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            switchNode1.should.have.property('name', 'switchNode');
            switchNode1.should.have.property('checkall', "true");
            switchNode1.should.have.property('rules', []);
            done();
        });
    });

    /**
     * Test a switch node where one argument is consumed by the rule (such as greater than).
     * @param rule - the switch rule (see 10-switc.js) string we're using
     * @param ruleWith - whatever the rule should be executed with (say greater than 5)
     * @param aCheckall - whether the switch flow should have the checkall flag set to true/false
     * @param shouldReceive - whether the helper node should receive a payload
     * @param sendPayload - the payload message we're sending
     * @param done - callback when done
     */
    function genericSwitchTest(rule, ruleWith, aCheckall, shouldReceive, sendPayload, done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":rule,"v":ruleWith}],checkall:aCheckall,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSwitchTest(flow, shouldReceive, sendPayload, done);
    }

    /**
     * Test a switch node where NO arguments are consumed by the rule (such as TRUE/FALSE)
     * @param rule - the switch rule (see 10-switc.js) string we're using
     * @param aCheckall - whether the switch flow should have the checkall flag set to true/false
     * @param shouldReceive - whether the helper node should receive a payload
     * @param sendPayload - the payload message we're sending
     * @param done - callback when done
     */
    function singularSwitchTest(rule, aCheckall, shouldReceive, sendPayload, done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":rule}],checkall:aCheckall,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSwitchTest(flow, shouldReceive, sendPayload, done);
    }

    /**
     * Test a switch node where two arguments are consumed by the rule (such as between).
     * @param rule - the switch rule (see 10-switc.js) string we're using
     * @param ruleWith - whatever the rule should be executed with (say between 5...)
     * @param ruleWith2 - whatever the rule should be executed with (say ...and 5)
     * @param aCheckall - whether the switch flow should have the checkall flag set to true/false
     * @param shouldReceive - whether the helper node should receive a payload
     * @param sendPayload - the payload message we're sending
     * @param done - callback when done
     */
    function twoFieldSwitchTest(rule, ruleWith, ruleWith2, aCheckall, shouldReceive, sendPayload, done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":rule,"v":ruleWith,"v2":ruleWith2}],checkall:aCheckall,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSwitchTest(flow, shouldReceive, sendPayload, done);
    }

    /**
     * Execute a switch test. Can specify whether the should node is expected to send a payload onwards to the helper node.
     * The flow and the payload can be customised
     * @param flow - the custom flow to be tested => must contain a switch node (switchNode1) wiring a helper node (helperNode1)
     * @param shouldReceive - whether the helper node should receive a payload
     * @param sendPayload - the payload message we're sending
     * @param done - callback when done
     */
    function customFlowSwitchTest(flow, shouldReceive, sendPayload, done) {
        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            helperNode1.on("input", function(msg) {
                try {
                    if (shouldReceive === true) {
                        msg.payload.should.equal(sendPayload);
                        done();
                    } else {
                        should.fail(null, null, "We should never get an input!");
                    }
                } catch(err) {
                    done(err);
                }
            });
            switchNode1.receive({payload:sendPayload});
            if (shouldReceive === false) {
                setTimeout(function() {
                    done();
                }, 200);
            }
        });
    }

    function customFlowSequenceSwitchTest(flow, seq_in, seq_out, repair, modifier, done) {
        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            var sid = undefined;
            var count = 0;
            if (modifier !== undefined) {
                modifier(switchNode1);
            }
            helperNode1.on("input", function(msg) {
                try {
                    msg.should.have.property("payload", seq_out[count]);
                    msg.should.have.property("parts");
                    var parts = msg.parts;
                    parts.should.have.property("id");
                    var id = parts.id;
                    if (sid === undefined) {
                        sid = id;
                    }
                    else {
                        id.should.equal(sid);
                    }
                    if (repair) {
                        parts.should.have.property("index", count);
                        parts.should.have.property("count", seq_out.length);
                    }
                    else {
                        parts.should.have.property("index", msg.xindex);
                        parts.should.have.property("count", seq_in.length);
                    }
                    count++;
                    if (count === seq_out.length) {
                        done();
                    }
                } catch (e) {
                    done(e);
                }
            });
            var len = seq_in.length;
            for (var i = 0; i < len; i++) {
                var parts = {index:i, count:len, id:222};
                var msg = {payload:seq_in[i], xindex:i, parts:parts};
                switchNode1.receive(msg);
            }
        });
    }

    
    
    it('should check if payload equals given value', function(done) {
        genericSwitchTest("eq", "Hello", true, true, "Hello", done);
    });

    it('should return nothing when the payload doesn\'t equal to desired string', function(done) {
        genericSwitchTest("eq", "Hello", true, false, "Hello!", done);
    });

    it('should check if payload NOT equals given value', function(done) {
        genericSwitchTest("neq", "Hello", true, true, "HEllO", done);
    });

    it('should return nothing when the payload does equal to desired string', function(done) {
        genericSwitchTest("neq", "Hello", true, false, "Hello", done);
    });

    it('should check if payload equals given numeric value', function(done) {
        genericSwitchTest("eq", 3, true, true, 3, done);
    });

    it('should return nothing when the payload doesn\'t equal to desired numeric value', function(done) {
        genericSwitchTest("eq", 2, true, false, 4, done);
    });

    it('should check if payload NOT equals given numeric value', function(done) {
        genericSwitchTest("neq", 55667744, true, true, -1234, done);
    });

    it('should return nothing when the payload does equal to desired numeric value', function(done) {
        genericSwitchTest("neq", 10, true, false, 10, done);
    });

    it('should check if payload is less than given value', function(done) {
        genericSwitchTest("lt", 3, true, true, 2, done);
    });

    it('should return nothing when the payload is not less than desired string', function(done) {
        genericSwitchTest("lt", 3, true, false, 4, done);
    });

    it('should check if payload less than equals given value', function(done) {
        genericSwitchTest("lte", 3, true, true, 3, done);
    });

    it('should check if payload is greater than given value', function(done) {
        genericSwitchTest("gt", 3, true, true, 6, done);
    });

    it('should return nothing when the payload is not greater than desired string', function(done) {
        genericSwitchTest("gt", 3, true, false, -1, done);
    });

    it('should check if payload is greater than/equals given value', function(done) {
        genericSwitchTest("gte", 3, true, true, 3, done);
    });

    it('should return nothing when the payload is not greater than desired string', function(done) {
        genericSwitchTest("gt", 3, true, false, -1, done);
    });

    it('should check if payload is greater than/equals given value', function(done) {
        genericSwitchTest("gte", 3, true, true, 3, done);
    });

    it('should check if payload is between given values', function(done) {
        twoFieldSwitchTest("btwn", "3", "5", true, true, 4, done);
    });

    it('should check if payload is between given string values', function(done) {
        twoFieldSwitchTest("btwn", "c", "e", true, true, "d", done);
    });

    it('should check if payload is not between given values', function(done) {
        twoFieldSwitchTest("btwn", 3, 5, true, false, 12, done);
    });

    it('should check if payload contains given value', function(done) {
        genericSwitchTest("cont", "Hello", true, true, "Hello World!", done);
    });

    it('should return nothing when the payload doesn\'t contain desired string', function(done) {
        genericSwitchTest("cont", "Hello", true, false, "This is not a greeting!", done);
    });

    it('should match regex', function(done) {
        genericSwitchTest("regex", "[abc]+", true, true, "abbabac", done);
    });

    it('should match regex with ignore-case flag set true', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"regex","v":"onetwothree","case":true}],checkall:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSwitchTest(flow, true, "oneTWOthree", done);
    });
    it('should not match regex with ignore-case flag unset', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"regex","v":"onetwothree"}],checkall:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSwitchTest(flow, false, "oneTWOthree", done);
    });
    it('should not match regex with ignore-case flag set false', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"regex","v":"onetwothree",case:false}],checkall:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSwitchTest(flow, false, "oneTWOthree", done);
    });

    it('should return nothing when the payload doesn\'t match regex', function(done) {
        genericSwitchTest("regex", "\\d+", true, false, "This is not a digit", done);
    });

    it('should return nothing when the payload doesn\'t contain desired string', function(done) {
        genericSwitchTest("cont", "Hello", true, false, "This is not a greeting!", done);
    });

    it('should check if input is true', function(done) {
        singularSwitchTest(true, true, true, true, done);
    });

    it('sends nothing when input is false and checking for true', function(done) {
        singularSwitchTest(true, true, false, false, done);
    });

    it('should check if input is indeed false', function(done) {
        singularSwitchTest(false, true, true, false, done);
    });

    it('sends nothing when input is false and checking for true', function(done) {
        singularSwitchTest(false, true, false, true, done);
    });

    it('should check input against a previous value', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{ "t": "gt", "v": "", "vt": "prev" }],checkall:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];

        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            var c = 0;
            helperNode1.on("input", function(msg) {
                if (msg.payload) {
                    try {
                        if (c === 0) {
                            msg.payload.should.equal(1);
                        }
                        if (c === 1) {
                            msg.payload.should.equal(2);
                            done();
                        }
                        c += 1;
                    } catch (err) {
                        done(err);
                    }
                } else {
                    done();
                }
            });
            switchNode1.receive({payload:1});
            switchNode1.receive({payload:0});
            switchNode1.receive({payload:-2});
            switchNode1.receive({payload:2});
        });
    });

    it('should check input against a previous value (2nd option)', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t": "btwn", "v": "10", "vt": "num", "v2": "", "v2t": "prev" }],checkall:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];

        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            var c = 0;
            helperNode1.on("input", function(msg) {
                if (msg.payload) {
                    try {
                        if (c === 0) {
                            msg.payload.should.equal(20);
                        }
                        if (c === 1) {
                            msg.payload.should.equal(25);
                            done();
                        }
                        c += 1;
                    } catch (err) {
                        done(err);
                    }
                } else {
                    done();
                }
            });
            switchNode1.receive({payload:0});
            switchNode1.receive({payload:20});  // between 10 and 0
            switchNode1.receive({payload:30});  // between 10 and 20
            switchNode1.receive({payload:20});  // between 10 and 30  yes
            switchNode1.receive({payload:30});  // between 10 and 20  no
            switchNode1.receive({payload:25});  // between 10 and 30  yes
        });
    });

    it('should check if input is indeed null', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"null"}],checkall:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];

        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            helperNode1.on("input", function(msg) {
                if (msg.payload === null) {
                    done();
                } else {
                    console.log("msg is ",msg);
                }
            });
            switchNode1.receive({payload:null});
        });
    });

    it('should check if input is indeed undefined', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"null"}],checkall:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];

        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            helperNode1.on("input", function(msg) {
                if (msg.payload === undefined) {
                    done();
                }
                else {
                    console.log("msg is ",msg);
                }
            });
            switchNode1.receive({payload:undefined});
        });
    });
    it('should treat non-existant msg property conditional as undefined', function(done) {
        var flow = [{"id":"switchNode1","type":"switch","z":"feee1df.c3263e","name":"","property":"payload","propertyType":"msg","rules":[{"t":"eq","v":"this.does.not.exist","vt":"msg"}],"checkall":"true","outputs":1,"x":190,"y":440,"wires":[["helperNode1"]]},
            {id:"helperNode1", type:"helper", wires:[]}];

        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            var received = [];
            helperNode1.on("input", function(msg) {
                received.push(msg);
            });
            // First message should be dropped as payload is not undefined
            switchNode1.receive({topic:"messageOne",payload:""});
            // Second message should pass through as payload is undefined
            switchNode1.receive({topic:"messageTwo",payload:undefined});
            setTimeout(function() {
                try {
                    received.should.have.lengthOf(1);
                    received[0].should.have.a.property("topic","messageTwo");
                    done();
                } catch(err) {
                    done(err);
                }
            },100)
        });
    });

    it('should check if input is indeed not null', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"nnull"}],checkall:false,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];


        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            helperNode1.on("input", function(msg) {
                if (msg.payload) {
                    done();
                } else {
                    try {
                        msg.payload.should.equal("Anything here");
                    } catch (err) {
                        done(err);
                    }
                }
            });
            switchNode1.receive({payload:"Anything here"});
        });
    });

    it('sends a message when the "else/otherwise" statement is selected' , function(done) {
        singularSwitchTest("else", true, true, 123456, done);
    });

    it('handles more than one switch statement' , function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"eq","v":"Hello"},{"t":"cont","v":"ello"}, {"t":"else"}],checkall:true,outputs:3,wires:[["helperNode1"], ["helperNode2"], ["helperNode3"]]},
                    {id:"helperNode1", type:"helper", wires:[]},
                    {id:"helperNode2", type:"helper", wires:[]},
                    {id:"helperNode3", type:"helper", wires:[]}];


        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            var helperNode2 = helper.getNode("helperNode2");
            var helperNode3 = helper.getNode("helperNode3");

            var nodeHitCount = 0;
            helperNode1.on("input", function(msg) {
                try {
                    msg.payload.should.equal("Hello");
                    nodeHitCount++;
                } catch (err) {
                    done(err);
                }
            });
            helperNode2.on("input", function(msg) {
                try {
                    msg.payload.should.equal("Hello");
                    nodeHitCount++;
                    if (nodeHitCount == 2) {
                        done();
                    } else {
                        try {
                            should.fail(null, null, "Both statements should be triggered!");
                        } catch (err) {
                            done(err);
                        }
                    }
                } catch (err) {
                    done(err);
                }
            });
            helperNode3.on("input", function(msg) {
                try {
                    should.fail(null, null, "The otherwise/else statement should not be triggered here!");
                } catch (err) {
                    done(err);
                }
            });
            switchNode1.receive({payload:"Hello"});
        });
    });

    it('stops after first statement' , function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"eq","v":"Hello"},{"t":"cont","v":"ello"}, {"t":"else"}],checkall:"false",outputs:3,wires:[["helperNode1"], ["helperNode2"], ["helperNode3"]]},
                    {id:"helperNode1", type:"helper", wires:[]},
                    {id:"helperNode2", type:"helper", wires:[]},
                    {id:"helperNode3", type:"helper", wires:[]}];

        helper.load(switchNode, flow, function() {
            var switchNode1 = helper.getNode("switchNode1");
            var helperNode1 = helper.getNode("helperNode1");
            var helperNode2 = helper.getNode("helperNode2");
            var helperNode3 = helper.getNode("helperNode3");

            helperNode1.on("input", function(msg) {
                try {
                    msg.payload.should.equal("Hello");
                    done();
                } catch (err) {
                    done(err);
                }
            });
            helperNode2.on("input", function(msg) {
                try {
                    should.fail(null, null, "The otherwise/else statement should not be triggered here!");
                } catch (err) {
                    done(err);
                }
            });
            helperNode3.on("input", function(msg) {
                try {
                    should.fail(null, null, "The otherwise/else statement should not be triggered here!");
                } catch (err) {
                    done(err);
                }
            });
            switchNode1.receive({payload:"Hello"});
        });
    });

    it('should handle JSONata expression', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"$abs(payload)",propertyType:"jsonata",rules:[{"t":"btwn","v":"$sqrt(16)","vt":"jsonata","v2":"$sqrt(36)","v2t":"jsonata"}],checkall:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSwitchTest(flow, true, -5, done);
    });

    it('should take head of message sequence (no repair)', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"head","v":3}],checkall:false,repair:false,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [0, 1, 2], false, undefined, done);
    });

    it('should take head of message sequence (repair)', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"head","v":3}],checkall:false,repair:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [0, 1, 2], true, undefined, done);
    });

    it('should take head of message sequence (w. context)', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"head","v":"count",vt:"global"}],checkall:false,repair:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [0, 1, 2], true, 
                                     function(node) {
                                         node.context().global.set("count", 3);
                                     }, done);
    });

    it('should take head of message sequence (w. JSONata)', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"head","v":"1+4/2",vt:"jsonata"}],checkall:false,repair:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [0, 1, 2], true, undefined, done);
    });

    it('should take tail of message sequence (no repair)', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"tail","v":3}],checkall:true,repair:false,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [2, 3, 4], false, undefined, done);
    });

    it('should take tail of message sequence (repair)', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"tail","v":3}],checkall:true,repair:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [2, 3, 4], true, undefined, done);
    });

    it('should take slice of message sequence (no repair)', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"index","v":1,"v2":3}],checkall:true,repair:false,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [1, 2, 3], false, undefined, done);
    });

    it('should take slice of message sequence (repair)', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"index","v":1,"v2":3}],checkall:true,repair:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [1, 2, 3], true, undefined, done);
    });

    it('should check JSONata expression is true', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",
                     rules:[{"t":"jsonata_exp","v":"payload%2 = 1","vt":"jsonata"}],
                     checkall:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSwitchTest(flow, true, 9, done);
    });
    
    it('should be able to use $I in JSONata expression', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"jsonata_exp","v":"$I % 2 = 1",vt:"jsonata"}],checkall:true,repair:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [1, 3], true, undefined, done);
    });

    it('should be able to use $N in JSONata expression', function(done) {
        var flow = [{id:"switchNode1",type:"switch",name:"switchNode",property:"payload",rules:[{"t":"jsonata_exp","v":"payload >= $N-2",vt:"jsonata"}],checkall:true,repair:true,outputs:1,wires:[["helperNode1"]]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        customFlowSequenceSwitchTest(flow, [0, 1, 2, 3, 4], [3, 4], true, undefined, done);
    });


    function customFlowSequenceMultiSwitchTest(flow, seq_in, outs, repair, done) {
        helper.load(switchNode, flow, function() {
            var n1 = helper.getNode("n1");
            var port_count = Object.keys(outs).length;
            var sid;
            var ids = new Array(port_count).fill(undefined);
            var counts = new Array(port_count).fill(0);
            var vals = new Array(port_count);
            var recv_count = 0;
            for (var id in outs) {
                var out = outs[id];
                vals[out.port] = out.vals;
                recv_count += out.vals.length;
            }
            var count = 0;
            function check_msg(msg, ix, vf) {
                try {
                    msg.should.have.property("payload");
                    var payload = msg.payload;
                    msg.should.have.property("parts");
                    vf(payload).should.be.ok;
                    var parts = msg.parts;
                    var evals = vals[ix];
                    parts.should.have.property("id");
                    var id = parts.id;
                    if (repair) {
                        if (ids[ix] === undefined) {
                            ids[ix] = id;
                        }
                        else {
                            ids[ix].should.equal(id);
                        }
                        parts.should.have.property("count", evals.length);
                        parts.should.have.property("index", counts[ix]);
                    }
                    else {
                        if (sid === undefined) {
                            sid = id;
                        }
                        else {
                            sid.should.equal(id);
                        }
                        parts.should.have.property("count", seq_in.length);
                        parts.should.have.property("index", msg.xindex);
                    }
                    var index = parts.index;
                    var eindex = counts[ix];
                    var eval = evals[eindex];
                    payload.should.equal(eval);
                    counts[ix]++;
                    count++;
                    if (count === recv_count) {
                        done();
                    }
                }
                catch (e) {
                    done(e);
                }
            }
            for (var id in outs) {
                (function() {
                    var node = helper.getNode(id);
                    var port = outs[id].port;
                    var vf = outs[id].vf;
                    node.on("input", function(msg) {
                        check_msg(msg, port, vf);
                    });
                })();
            }
            for(var i in seq_in) {
                n1.receive({payload:seq_in[i], xindex:i,
                            parts:{index:i, count:seq_in.length, id:222}});
            }
        });
    }

    it('should not repair message sequence for each port', function(done) {
        var flow = [{id:"n1",type:"switch",name:"switchNode",property:"payload",
                     rules:[{"t":"gt","v":0},{"t":"lt","v":0},{"t":"else"}],
                     checkall:true,repair:false,
                     outputs:3,wires:[["n2"],["n3"],["n4"]]},
                    {id:"n2", type:"helper", wires:[]},
                    {id:"n3", type:"helper", wires:[]},
                    {id:"n4", type:"helper", wires:[]}
                   ];
        var data = [ 1, -2, 2, 0, -1 ];
        var outs = {
            "n2" : { port:0, vals:[1, 2],
                     vf:function(x) { return(x > 0); } },
            "n3" : { port:1, vals:[-2, -1],
                     vf:function(x) { return(x < 0); } },
            "n4" : { port:2, vals:[0],
                     vf:function(x) { return(x == 0); } },
        };
        customFlowSequenceMultiSwitchTest(flow, data, outs, false, done);
    });

    it('should repair message sequence for each port', function(done) {
        var flow = [{id:"n1",type:"switch",name:"switchNode",property:"payload",
                     rules:[{"t":"gt","v":0},{"t":"lt","v":0},{"t":"else"}],
                     checkall:true,repair:true,
                     outputs:3,wires:[["n2"],["n3"],["n4"]]},
                    {id:"n2", type:"helper", wires:[]}, // >0
                    {id:"n3", type:"helper", wires:[]}, // <0
                    {id:"n4", type:"helper", wires:[]}  // ==0
                   ];
        var data = [ 1, -2, 2, 0, -1 ];
        var outs = {
            "n2" : { port:0, vals:[1, 2],
                     vf:function(x) { return(x > 0); } },
            "n3" : { port:1, vals:[-2, -1],
                     vf:function(x) { return(x < 0); } },
            "n4" : { port:2, vals:[0],
                     vf:function(x) { return(x == 0); } },
        };
        customFlowSequenceMultiSwitchTest(flow, data, outs, true, done);
    });

    it('should repair message sequence for each port (overlap)', function(done) {
        var flow = [{id:"n1",type:"switch",name:"switchNode",property:"payload",
                     rules:[{"t":"gte","v":0},{"t":"lte","v":0},{"t":"else"}],
                     checkall:true,repair:true,
                     outputs:3,wires:[["n2"],["n3"],["n4"]]},
                    {id:"n2", type:"helper", wires:[]}, // >=0
                    {id:"n3", type:"helper", wires:[]}, // <=0
                    {id:"n4", type:"helper", wires:[]}  // none
                   ];
        var data = [ 1, -2, 2, 0, -1 ];
        var outs = {
            "n2" : { port:0, vals:[1, 2, 0],
                     vf:function(x) { return(x > 0); } },
            "n3" : { port:1, vals:[-2, 0, -1],
                     vf:function(x) { return(x < 0); } },
            "n4" : { port:2, vals:[],
                     vf:function(x) { return(false); } },
        };
        customFlowSequenceMultiSwitchTest(flow, data, outs, true, done);
    });

    it('should handle too many pending messages', function(done) {
        var flow = [{id:"n1",type:"switch",name:"switchNode",property:"payload",
                     rules:[{"t":"tail","v":2}],
                     checkall:true,repair:false,
                     outputs:3,wires:[["n2"]]},
                    {id:"n2", type:"helper", wires:[]}
                   ];
        helper.load(switchNode, flow, function() {
            var n1 = helper.getNode("n1");
            RED.settings.nodeMessageBufferMaxLength = 2;
            setTimeout(function() {
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "switch";
                });
                var evt = logEvents[0][0];
                evt.should.have.property('id', "n1");
                evt.should.have.property('type', "switch");
                evt.should.have.property('msg', "switch.errors.too-many");
                done();
            }, 150);
            n1.receive({payload:3, parts:{index:2, count:4, id:222}});
            n1.receive({payload:2, parts:{index:1, count:4, id:222}});
            n1.receive({payload:4, parts:{index:3, count:4, id:222}});
            n1.receive({payload:1, parts:{index:0, count:4, id:222}});
        });
    });
    
});
