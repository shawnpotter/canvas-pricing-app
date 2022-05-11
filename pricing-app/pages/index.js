import Head from 'next/head'
import { useState } from 'react';
import Web3 from 'web3';
import calculatorContract from '../blockchain/calculator';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {

  //Constant useState variables with setters 
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState(''); //address is never used because we don't send transactions in this but require it for MetaMask integration 
  const [localContract, setLocalContract] = useState('');

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

  /* Create wallet handler to connect to browser wallet */
  const walletHandler = async () => {
    if(typeof window !== 'undefined' & typeof window.ethereum !== 'undefined') {
      //try to connect to wallet
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        //set Web3 Instance
        const web3 = new Web3(window.ethereum);

        //get account addresses
        const accounts = await web3.eth.getAccounts();

        //set Address
        setAddress(accounts[0]);

        //create local contract copy
        const calculator = calculatorContract(web3);
        setLocalContract(calculator);

      } catch(err) {
        setError(err.message);
      }
    } else {
      console.log('please install metamask')
    }
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
                <button onClick={walletHandler} className='btn btn-primary'>Connect Wallet</button>
            </div>
          </nav>
          <div className='container form-main'>
            <form className='calculatorForm'>
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
                    <button className='btn btn-success'  onClick={getCalculationHandler}>Submit</button>
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
            </form>
        </div>
      </div>
    </div>
  )
}

export default Home;
