import Head from 'next/head'
import { useState } from 'react';
import Web3 from 'web3';
import calculatorContract from '../blockchain/calculator';
import styles from '../styles/Home.module.css'

const Home = () => {

  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [localContract, setLocalContract] = useState('');

  const updateHeight = event => {
    setHeight(event.target.value);
  }
  const updateWidth = event => {
    setWidth(event.target.value);
  }
  const updatePrice = event => {
    setPrice(event.target.value);
  }

  const getCalculationHandler = async () => {
    try {
      const finalPrice = await localContract.methods.calculatePrice(height, width, price).call().gas(3000);
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
