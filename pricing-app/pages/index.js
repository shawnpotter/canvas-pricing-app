import Head from 'next/head'
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import {useWeb3React} from "@web3-react/core"
import calculatorContract from '../blockchain/calculator';
import 'bootstrap/dist/css/bootstrap.min.css';
import { injected } from '../components/connectors/connectors';

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
  const [connectBtnHidden, setConnecBtnHidden] = useState('');

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
      //TODO Multiply price by 100 to turn minimum 0.01 vakue into a whole number

      const finalPrice = await localContract.methods.calculatePrice(height, width, price).call({ gas: 50000000 });

      //TODO convert price back into decimal by dividing the result by the original multipied amount
      setResult(finalPrice);

       
    } catch(err) {
      setError(err.message);
    }
  }

  useEffect( () => {
    ethereum.on('accountsChanged', function(accounts) {
      if(accounts.length > 0 && localStorage?.getItem('isWalletConnected')){
        connect();
      } else {
        disconnect();
      }
    });
  }, []);

  useEffect( () => {
    const connectWalletOnLoad = async () => {
      if(localStorage?.getItem('isWalletConnected') === 'true') {
        try {
          await activate(injected);
          createLocalContract();
          
          switchButtons(true);
        }
        catch(err) {
          console.log(err);
        }
      }
    }
    connectWalletOnLoad();
  }, []);

function switchButtons(isWalletConnected) {
  if(isWalletConnected) {
    setConnecBtnHidden('Hidden');
    setStatusBtn('');
  } else {
    setConnecBtnHidden('');
    setStatusBtn('Hidden');
  }
}

async function connect(){
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

function createLocalContract(){
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
            </div>
          </nav>
          <section>
            <div className='container'>
                <p>Result: {result}</p>
            </div>
          </section>
          <section>
            <div className='container text-danger'>
                <p>{error}</p>
            </div>
          </section>
          <div>
            <form className='calculatorForm'>
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
            </form>
            <div>
                <button className='btn btn-success'  onClick={getCalculationHandler}>Submit</button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Home;
