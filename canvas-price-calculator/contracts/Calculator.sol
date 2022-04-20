//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

//create contract
contract CanvasPricingCalculator {

    //create function to calculate price per square inch of canvas and return a value
    function calculatePrice(uint height, uint width, uint pricePerSquareInch) public pure returns (uint){
        uint finalPrice = (height * width) * pricePerSquareInch;
        
        //return final price value
        return finalPrice;
    }
}