const Web3 = require('web3');
const MetaMaskOnboarding = require('@metamask/onboarding');

const web3 = new Web3('https://ropsten.infura.io/v3/8702a1f521f14d99ad45215c22744643')

const myContractAdress = "0xb42f799b90CE6Be7339C4f21088081f02fBEb319"
const myContracABI = [
  {
    "stateMutability": "payable",
    "type": "fallback",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "atBlock",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "invested",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getValueInvested",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getValueAtBlock",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
]

let contract = new web3.eth.Contract(myContracABI,myContractAdress)

window.addEventListener('DOMContentLoaded', function() {
  
  const onboardButton = document.getElementById('connectButton');
  const withdrawButton = document.getElementById('withdrawButton')
  const investButton = document.getElementById('investButton');
  const amountInvested = document.getElementById('amountInvested');
  const amountAvailable = document.getElementById('amountAvailable');
  const amountToInvest = document.getElementById('amountToInvest');
  let accounts;
  
  async function connected() {
    if(ethereum.isMetaMask){
      accounts = await ethereum.request({ method: 'eth_accounts' });
      MetaMaskClientCheck();
    }
    
  }
  connected();

  const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    console.log('Metamask is installed');
    const { ethereum } = window;
    console.log('Ethereum window');
    return Boolean(ethereum && ethereum.isMetaMask);
    
  };
  const MetaMaskClientCheck = () => {
    //Now we check to see if MetaMask is installed
    if (!isMetaMaskInstalled()) {
      //If it isn't installed we ask the user to click to install it
      onboardButton.innerText = 'Click here to install MetaMask!';
      onboardButton.onclick = onClickInstall;
      onboardButton.disabled = false;
    } else if (accounts && accounts.length > 0) {
      onboardButton.innerText = 'Connected';
      onboardButton.disabled = true;
      onboarding.stopOnboarding();
      investButton.onclick = onClickInvest;
      withdrawButton.onclick = onClickWithdraw;
      getInvestedAndAvailable();
      x=setInterval(() => {
        getInvestedAndAvailable();
      }, 10000);
    } else {
      //If it is installed we change our button text
      onboardButton.innerText = 'Connect';
      onboardButton.disabled = false;
      onboardButton.onclick = async () => {
        await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        accounts = await ethereum.request({ method: 'eth_accounts' });
        MetaMaskClientCheck();
      };
    }
  };
  MetaMaskClientCheck();
  if (MetaMaskOnboarding.isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', (newAccounts) => {
      console.log("connected");
      accounts = newAccounts;
      MetaMaskClientCheck();
    });
  }
  


})

const onboarding = new MetaMaskOnboarding();

const onClickInstall = async () => {
  console.log("trying to install metamask")
  document.getElementById('connectButton').innerText = 'Onboarding in progress';
  //On this object we have startOnboarding which will start the onboarding process for our end user
  onboarding.startOnboarding();
}

const onClickInvest = async () => {
  const contractAddress = '0xb42f799b90CE6Be7339C4f21088081f02fBEb319'
  const amountEth = amountToInvest.value
  const accounts = await ethereum.request({ method: 'eth_accounts' });

  contract.methods.getValueInvested(accounts[0]).call().then(function(amountInvested) {
    console.log("Invested", web3.utils.fromWei(amountInvested));
})

  const transaction ={
    from: accounts[0],
    to: contractAddress,
    value: web3.utils.toWei(amountEth, 'ether')
  }
  await ethereum.request({
    method: 'eth_sendTransaction',
    params: [transaction],
  });
}

const onClickWithdraw = async () => {
  const contractAddress = '0xb42f799b90CE6Be7339C4f21088081f02fBEb319'
  const amountEth = "0"
  const accounts = await ethereum.request({ method: 'eth_accounts' });

  contract.methods.getValueInvested(accounts[0]).call().then(function(amountInvested) {
    console.log("Invested", web3.utils.fromWei(amountInvested));
})

  const transaction ={
    from: accounts[0],
    to: contractAddress,
    value: web3.utils.toWei(amountEth, 'ether')
  }
  await ethereum.request({
    method: 'eth_sendTransaction',
    params: [transaction],
  });
}

async function getInvestedAndAvailable() {
    const blocknow = await web3.eth.getBlockNumber();
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    let invested = await contract.methods.getValueInvested(accounts[0]).call().then(function(amountInvested) {
      return web3.utils.fromWei(amountInvested);
    })
    let blocknumber = await contract.methods.getValueAtBlock(accounts[0]).call().then(function(blocknumber) {
      return blocknumber
    })
    const available = invested * 5 / 100 * (blocknow - blocknumber) / 5900
    amountAvailable.innerText = "Eth available: "+available
    amountInvested.innerText = "Eth invested: "+invested
}
    

































  

