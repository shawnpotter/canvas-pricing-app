import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useWeb3React } from "@web3-react/core"
import calculatorContract from '../blockchain/calculator';
import 'bootstrap/dist/css/bootstrap.min.css';
import { injected } from '../components/connectors/connectors';
import metamaskLogo from '../public/metamask-fox.png';
import Guidelines from '../pages/api/article.js';

const Home = () => {

  const { activate, deactivate } = useWeb3React();

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


  //Updaters for the form inputs that update the values typed into the form fields.
  const updateHeight = event => {
    setHeight(event.target.value);
  }
  const updateWidth = event => {
    setWidth(event.target.value);
  }
  const updatePrice = event => {
    setPrice(event.target.value);
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

  //Debugging for forcibly resetting local Storage. Assign to a button's onclick to use
  const resetStorage = () => {
    localStorage.setItem('isWalletConnected', false);
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
      setConnecBtnHidden(false);
      setMetaMaskNotInstalled(false);
      setInstallBtnHidden(true);

      ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length > 0 && localStorage?.getItem('isWalletConnected')) {
          connect();
        } else {
          disconnect();
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
      if (localStorage?.getItem('isWalletConnected') === 'true') {
        try {
          await activate(injected);
          createLocalContract();

          switchButtons(true);
        }
        catch (err) {
          console.log(err);
        }
      }
    }
    connectWalletOnLoad();
  }, []);

  function switchButtons(isWalletConnected) {
    if (isWalletConnected) {
      setConnecBtnHidden('Hidden');
      setStatusBtn('');
    } else {
      setConnecBtnHidden('');
      setStatusBtn('Hidden');
    }
  }

  async function connect() {
    try {
      await activate(injected);
      createLocalContract();
      localStorage.setItem('isWalletConnected', true);
      switchButtons(true);
    }
    catch (err) {
      console.log(err);
    }
  }

  async function disconnect() {
    try {
      deactivate();
      localStorage.setItem('isWalletConnected', false);
      console.log('cleared local storage');
      switchButtons(false);
    }
    catch (err) {
      console.log(err);
    }
  }

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
        <title>Calculator App</title>
        <meta name="description" content="A blockchain pricing tool" />
      </Head>
      <div className='container'>
        <nav className='navbar mt-4'>
          <div>
            <div className='navbar-brand'>
              <h1>Calculator App</h1>
            </div>
          </div>
          <div className='navbar-end'>
            <button onClick={connect} className='btn btn-primary' hidden={connectBtnHidden}>Connect Wallet</button>
            <button className='btn btn-primary' hidden={statusBtn} disabled>Connected</button>
            <button onClick={redirectMetaMask} className='btn btn-primary' hidden={installBtnHidden}>
              <div className='row pt-1'>
                <div className='col'>
                  <Image height='23px' width='25px' src={metamaskLogo}></Image>
                </div>
                <div className='col-auto'>
                  <span>Install MetaMask</span>
                </div>
              </div>
            </button>
          </div>
        </nav>
        <div className='container form-main'>
          <div className='calculatorForm'>
            <div className='row'>
              <div className='col-6'>
                <div>
                  <label className='form-label'> Width:
                    <input onChange={updateWidth} className='form-control' type={"text"} name={"width"} />
                  </label>
                </div>
                <div>
                  <label className='form-label'> Height:
                    <input onChange={updateHeight} className='form-control' type={"text"} name={"height"} />
                  </label>
                </div>
                <div>
                  <label className='form-label'> Price per Square Inch:
                    <input onChange={updatePrice} className='form-control' type={"text"} name={"squareInch"} />
                  </label>
                </div>
                <div className='container btn_container pt-5'>
                  <button className='btn btn-success' onClick={getCalculationHandler} disabled={metaMaskNotInstalled}>Submit</button>
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
        <Guidelines/> 
       </div>
      </div>
    </div>
  )
}

export default Home;