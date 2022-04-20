const abi = [
    {
        "inputs":
        [
            {
                "internalType":"uint256",
                "name":"height",
                "type":"uint256"
            },
            {
                "internalType":"uint256",
                "name":"width",
                "type":"uint256"
            },
            {
                "internalType":"uint256",
                "name":"pricePerSquareInch",
                "type":"uint256"
            }
        ],
        "name":"calculatePrice",
        "outputs":
        [
            {
                "internalType":"uint256",
                "name":"",
                "type":"uint256"
            }
        ],
        "stateMutability":"pure",
        "type":"function"
    }
];

const calculatorContract = web3 => {
    return new web3.eth.Contract(
        abi, 
        "0xFC4218c6c871142df290b907e4380fe36035B369"
    );
}

export default calculatorContract;