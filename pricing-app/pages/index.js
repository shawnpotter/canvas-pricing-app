import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home = () => {
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
                <button /* onClick={walletHandler} */ className='btn btn-primary'>Connect Wallet</button>
            </div>
          </nav>
          <section>
            <div className='container'>
                <p>Result: placeholder text {/* {result} */}</p>
            </div>
          </section>
          <section>
            <div className='container text-danger'>
                <p>{/* {error} */}</p>
            </div>
          </section>
          <div>
            <form className='calculatorForm'>
                <div>
                    <label className='form-label'> Width:
                        <input /* onChange={updateWidth} */ className='form-control' type={"text"} name={"width"} />
                    </label>
                </div>
                <div>
                    <label className='form-label'> Height:
                        <input /* onChange={updateHeight} */ className='form-control' type={"text"} name={"height"} />
                    </label>
                </div>
                <div>
                    <label className='form-label'> Price per Square Inch:
                        <input /* onChange={updatePrice} */ className='form-control' type={"text"} name={"squareInch"} />
                    </label>
                </div>
            </form>
            <div>
                <button className='btn btn-success'  /* onClick={getCalculationHandler} */>Submit</button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Home;
