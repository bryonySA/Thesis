module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
    networks: {
        development: {
            host: "localhost",
            port: 9545,
            network_id: "*" // Match any network id
        },
        ganache: {
            host: "localhost",
            port: 7545,
            network_id: "*", // Match any network id
            gas: 4600000
        }
    }
};
