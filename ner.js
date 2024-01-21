

module.exports = function(RED) {
      // Dynamically import the Transformers.js library
  //let { pipeline, env } = await import('@xenova/transformers');

    function NER(config) {
      RED.nodes.createNode(this,config);
      this.task = config.task;
      this.model = config.model;

      var node = this;
      node.on('input', function(msg) {
          msg.payload = "ROFL";
          node.send(msg);
      });
    }
    RED.nodes.registerType("ner", NER);
}
