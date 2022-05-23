import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useWeb3React } from "@web3-react/core"
import calculatorContract from '../blockchain/calculator';
import 'bootstrap/dist/css/bootstrap.min.css';
import metamaskLogo from '../public/metamask-fox.png';
import Guidelines from '../pages/api/article.js';

const Home = () => {

  const { deactivate } = useWeb3React();

  //React hooks
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [price, setPrice] = useState('');
  const [localContract, setLocalContract] = useState('');
  const [statusBtn, setStatusBtn] = useState('Hidden');
  const [connectBtnHidden, setConnecBtnHidden] = useState(true);
  const [metaMaskNotInstalled, setMetaMaskNotInstalled] = useState(false);
  const [installBtnHidden, setInstallBtnHidden] = useState(true)
  const [widthValidHidden, setWidthValidHidden] = useState(true);
  const [heightValidHidden, setHeightValidHidden] = useState(true);
  const [priceValidHidden, setPriceValidHidden] = useState(true);
  const [widthValidText, setWidthValidText] = useState('');
  const [heightValidText, setHeightValidText] = useState('');
  const [priceValidText, setPriceValidText] = useState('');
  const [walletErrorHidden, setWalletErrorHidden] = useState(true);
  const [walletError, setWalletError] = useState('');
  const [account, setAccount] = useState('');



  //Updaters for the form inputs that update the values typed into the form fields.
  const updateHeight = event => {
    setHeight(event.target.value);
  }
  const updateWidth = event => {
    setWidth(event.target.value);
  }
  const updatePrice = event => {
    let num =event.target.value;
    let priceValueFormat = (Number.parseFloat(num).toFixed(2));
    setPrice(priceValueFormat);
  }

  /* 
   * runs validation checks on the inputs and if all return true then runs the
   * getCalculationHandler function. If 'result' was previously changed then also
   * changes 'result' back to an empty string.
   */
  function validator() {
    console.log(account);
    //run validate functions and set boolean vars for the results
    let widthValid = validateWidthInput();
    let heightValid = validateHeightInput();
    let priceValid = validatePriceInput();
    let walletConnected = validateWalletConnection();

    //if all functions returned true run getCalculationHandler()
    if(widthValid && heightValid && priceValid && walletConnected) {
      getCalculationHandler();
    } 
    //if result was previously changed then revert back to empty string
    else if (result !== '') {
      setResult('');
    }
  }

  //function checks isWalletConnected in local storage and display an error if needed
  function validateWalletConnection() {

    //if isWalletConnected is not equal to true
    if(account.length < 1) {
      
      //set and reveal wallet error message
      setWalletError('You must connect your Wallet')
      setWalletErrorHidden(false);
      
      //return false to validator
      return false;
    } else {

      //return true to validator
      return true;

    }
  }

  //function for validating Width Input
  function validateWidthInput() {

    //if width is not a number or an empty string set error message and set hidden false
    if (width.isNaN || width === '') {
      setWidthValidText("Must be a number");
      setWidthValidHidden(false);
    } 
    //else if width is less than zero set error message and set hidden false
    else if (width < 1) {
      setWidthValidText("Must enter a number higher than zero");
      setWidthValidHidden(false);
    } 
    //else return true and set the error message back to hidden
    else {
      if(!widthValidHidden) {
        setWidthValidHidden(true);
      }
      return true;
    }
  }

  //function for validating Height input
  function validateHeightInput() {
    //if height is not a number or an empty string set error message and set hidden false
    if (height.isNaN || height === '') {
      
      setHeightValidText("Must be a number");
      setHeightValidHidden(false);
      
      return false;
    } 
    //else if height is less than zero set error message and set hidden false
    else if (height < 1) {
      
      setHeightValidText("Must enter a number higher than zero");
      setHeightValidHidden(false);
      
      return false;
    } 
    //else return true and set the error message back to hidden
    else {
      if (!heightValidHidden) {
        setHeightValidHidden(true);
      }
      return true;
    }
  }

  //function for validating Price input
  function validatePriceInput() {

    //if price is not a number or an empty string
    if(price.isNaN || price === '') {

      //set error message and reveal
      setPriceValidText("Must be a number");
      setPriceValidHidden(false);
      
      //return false to validator()
      return false;
    } 
    //else if price is less than zero
    else if (price < 0.01) {

      //set error message and reveal
      setPriceValidText("Must enter a number higher than zero");
      setPriceValidHidden(false);

      //return false to validator()
      return false;
    } 
    //else return true and set the Validation message back to hidden
    else {
      //if priceValidHidden equals false
      if (!priceValidHidden) {

        //set priceValidHidden to true and hide error message
        setPriceValidHidden(true);
      }

      //return true to validator()
      return true;
    }
  }

  //Handler that sends the width, height and price per square inch to the contract.
  const getCalculationHandler = async () => {
    try {
      
      //multiply price by 100 to eliminate floating point numbers
      const finalPrice = await localContract.methods.calculatePrice(height, width, (price * 100)).call({ gas: 50000000 });

      //convert price back into decimal by dividing the result by the original multipied amount and set Result
      setResult((finalPrice/100));

    } catch (err) {
      setError(err.message);
    }
  }

  /*
   * If metamask is not installed hide the connect button and disable the submit button.
   * Once the user installs metamask, reload the page.
   */
  useEffect(() => {
    if (typeof ethereum === 'undefined') {
      setConnecBtnHidden(true);
      setMetaMaskNotInstalled(true);
      setInstallBtnHidden(false);
    }
  });

  /* 
   * If metamask is installed and ethereum is not undefined (metamask itself sets ethereum) 
   * then check for account change. If accounts still has an address then reconnect to the
   * new address, otherwise if accounts is empty disconnect the user. 
   */
  useEffect(() => {
    if (typeof ethereum !== 'undefined') {
      console.log('Metamask Found');
      
      //unhide connect button
      setConnecBtnHidden(false);
      
      //enable the submit button
      setMetaMaskNotInstalled(false);
      
      //hide the install button
      setInstallBtnHidden(true);

      //if the account is changed inside the wallet
      ethereum.on('accountsChanged', function (accounts) {

      //if isWalletConnected is true 
      if(localStorage.getItem('isWalletConnected') === 'true') {
        
        //and accounts.length is greater than zero
        if (accounts.length > 0) {
        
          //connect to new account
          connect();
          console.log('MetaMask Connected.')

        } else {
          //disconnect from the app
          
          disconnect();
        }
      }
      });
    }
  }, []);

  /* 
   * When the page is reloaded and localStorage variable 'isWalletConnected' equals true
   * then reactivate the connection between the wallet and the page.
   */
  useEffect(() => {
    const connectWalletOnLoad = async () => {

      //if isWalletConnected variable in local storage is true
      if (localStorage.getItem('isWalletConnected') === 'true') {
        try {

          //then reconnect to the wallet and recreate the local contract
          connect();
        }
        catch (err) {
          console.log(err);
        }
      }
    }
    connectWalletOnLoad();
  }, []);

  //switches the 'Connect Wallet' button and the 'Connected' button based on isWalletConnected
  function switchButtons(isWalletConnected) {
    if (isWalletConnected) {
      setConnecBtnHidden('Hidden');
      setStatusBtn('');
    } else { 
      setConnecBtnHidden('');
      setStatusBtn('Hidden');
    }
  }

  //connects to the wallet, creates a local contract, and then sets a localStorage var
  const connect = async () => {
    ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((error) => {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log('Please connect to MetaMask.');
      } else {
        console.error(error);
      }
    });
  }
  
  const handleAccountsChanged = async () => {
    
    const accounts = await ethereum.request({ method: "eth_accounts" });
    
    setAccount(accounts);

    createLocalContract();
    
    localStorage.setItem('isWalletConnected', 'true');
    
    //if wallet error showing hide wallet error message
    if(!walletErrorHidden) {
      setWalletErrorHidden(true);
    }

    switchButtons(true);
    
    console.log('MetaMask Connected.')
  }

  //when metamask emits that it disconnected deactivate, set local storage var, and switch buttons
  const disconnect = async () => {
    try {
      deactivate();
      console.log('MetaMask Disconnected...');

      localStorage.setItem('isWalletConnected', 'false');
      console.log('Cleared local storage.');

      setAccount('');
      
      switchButtons(false);
    }
    catch (err) {
      console.log(err);
    }
  }

  //redirects the user to metamask's website when they click the install button
  function redirectMetaMask() {
    window.open("https://metamask.io/download/", "_blank")
  }

  function createLocalContract() {
    //set Web3 Instance
    const web3 = new Web3(window.ethereum);

    //create local contract copy
    const calculator = calculatorContract(web3);
    setLocalContract(calculator);
  }

  //Render for the web page
  return (
    <div>
      <Head>
        <title>Canvas Pricing App</title>
        <meta name="description" content="A blockchain pricing tool" />
      </Head>
      <div className='container'>
        <nav className='navbar mt-4'>
          <div>
            <div className='navbar-brand'>
              <h1>Canvas Pricing App <span className='beta-text fs-6'>BETA</span></h1>
            </div>
          </div>
          <div className='pb-3 pb-lg-0'>
            <span className='text-warning'><strong>*Users Need to be Connected to Rinkeby Test Network</strong></span>
          </div>
          <div className='navbar-end'>
            <button onClick={connect} className='btn btn-primary' hidden={connectBtnHidden}>Connect Wallet</button>
            <button className='btn btn-primary' hidden={statusBtn} disabled>Connected</button>
            <div onClick={redirectMetaMask} className='btn btn-primary' hidden={installBtnHidden}>
              <div className='row pt-1'>
                <div className='col'>
                  <Image height='23px' width='25px' src={metamaskLogo} alt="The logo for MetaMask Crypto Wallet"></Image>
                </div>
                <div className='col-auto'>
                  <span>Install MetaMask</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className='row'>
          <div className='container form-main col-lg-8'>
            <div className='calculatorForm'>
              <div className='row'>
                <div className='col-6'>
                  <div>
                    <label className='form-label'> Width: (Inches)
                      <input onChange={updateWidth} className='form-control' type={"text"} name={"width"} required/>
                      <span className='text-danger' hidden={widthValidHidden}>{widthValidText}</span>
                    </label>
                  </div>
                  <div>
                    <label className='form-label'> Height: (Inches)
                      <input onChange={updateHeight} className='form-control' type={"text"} name={"height"} required/>
                      <span className='text-danger' hidden={heightValidHidden}>{heightValidText}</span>
                    </label>
                  </div>
                  <div>
                    <label className='form-label'> Price per Square Inch: $USD
                      <input onChange={updatePrice} className='form-control' type={"number"} step=".01" min={"0"} max={"10"} placeholder={"0.00"} name={"squareInch"} required/>
                      <span className='text-danger' hidden={priceValidHidden}>{priceValidText}</span>
                    </label>
                  </div>
                  <div className='container btn_container pt-5'>
                    <button className='btn btn-success' onClick={validator} disabled={metaMaskNotInstalled}>Submit</button>
                  </div>
                  <div className='row'>
                    <div className='col-12 text-center'>
                      <span className='text-danger' hidden={walletErrorHidden}><strong>{walletError}</strong></span>
                    </div>
                  </div>
                </div>
                <div className='col-6'>
                  <section>
                    <div className='container result'>
                      <p>Result: {result}</p>
                    </div>
                  </section>
                  <section>
                    <div className='container text-danger'>
                      <p>{error}</p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4 pt-lg-0 pt-5 align-self-center'>
            <Guidelines/> 
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;