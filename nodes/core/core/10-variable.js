module.exports = function(RED) {

  function setVariable(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var payload = config.payload;
    var payloadType = config.payloadType;
    node.on('input', function(msg) {
      this.context().global.set(payload, msg.payload);
      console.log(payload);
      console.log(msg);
      node.send(msg);
    });
  }
  RED.nodes.registerType("set-variable",setVariable);

}
