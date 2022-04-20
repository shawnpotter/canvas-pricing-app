const Calculator = artifacts.require("Calculator");

module.exports = function (deployer) {
  deployer.deploy(Calculator);
};
