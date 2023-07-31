// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

contract EduPool is Initializable {

    enum Status {
        Pending,
        Active,
        Suspended,
        Closed
    }

    struct PoolData {
        Status status;
        string name;
        IERC20Upgradeable stablecoin;
        uint256 balance;
        uint256 borrowed;
        uint256 interestPeriod;
        uint256 interestRate;
        uint256 accruedTimer;
        address borrower;
        address[] issuers;
    }

    PoolData public pool;

    /**
     * @dev Modifier that validate contract addresses.
     */
    modifier isContract(address contractAddress) {
        require(
            AddressUpgradeable.isContract(contractAddress),
            "Invalid contract address provided"
        );
        _;
    }
    
    /**
     * @notice Restricts the function to not be callable with the zero address.
     */
    modifier nonZeroAddress(address account) {
        require(account != address(0), "Cannot be the zero address");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the EduPool contract
     * 
     * @param _name The name of the pool
     * @param _stablecoin The stablecoin to be used on the pool
     * @param _borrower The borrower of the pool
     * @param _interestPeriod The interest period of the loans
     * @param _interestRate The interest rate for the loans
     */
    function initialize(
        string memory _name,
        address _stablecoin,
        address _borrower,
        uint256 _interestPeriod,
        uint256 _interestRate
    ) 
        nonZeroAddress(_borrower)
        isContract(_stablecoin)
        initializer 
        public
    {
        require(_interestPeriod > 0, "Insufficient interest period");

        pool.name = _name;
        pool.status = Status.Pending;
        pool.stablecoin = IERC20Upgradeable(_stablecoin);
        pool.balance = 0;
        pool.borrowed = 0;
        pool.interestPeriod = _interestPeriod;
        pool.interestRate = _interestRate;
        pool.accruedTimer = 0;
        pool.borrower = _borrower;        
    }

    function version() external pure returns (uint256) {
        return 1;
    }

    function name() public view returns (string memory) {
        return pool.name;
    }
}