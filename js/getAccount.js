//Connect to blockchain (Ganache)
// const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
// web3 = new Web3(provider);
web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

// function to retrieve the 1st account from the blockchain and set it as the default account
async function getAccount() {
    let accounts = await web3.eth.getAccounts();
    web3.defaultAccount = accounts[0];
    console.log('Default account: ' + web3.eth.defaultAccount);
    return web3.eth.defaultAccount;

    // Fetch all bugs and create the list
    
}
