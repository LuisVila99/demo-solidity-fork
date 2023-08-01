// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "hardhat/console.sol";

abstract contract EduPoolBase is Initializable, OwnableUpgradeable {

    // Data

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
        mapping(address => uint256) issuers;
    }

    PoolData public pool;
    bytes32 public signaturesRegistry;

    // Events
    /**
     * @notice Emitted when an pool operation is signed.
     */
    event Sign(
        string indexed name,
        address indexed entity,
        string indexed operation,
        bytes32 signature
    );

    /**
     * @notice Emitted when the pool is activated by borrower.
     */
    event Active(
        string indexed name,
        address indexed borrower,
        uint256 interestPeriod,
        uint256 interestRate
    );

    // Modifiers

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

    modifier onlyActivePool() {
        require(pool.status == Status.Active, "Pool is not active");
        _;
    }

    /**
     * @notice Controls the obligation `status` to be `pending` at function invocation.
     */
    modifier onlyPendingPool() {
        require(
            pool.status == Status.Pending,
            "Pool is not pending"
        );
        _;
    }

    /**
     * @notice Restricts the function access to the borrower account.
     */
    modifier onlyBorrower() {
        require(
            pool.borrower == _msgSender(),
            "Caller is not the borrower"
        );
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

        __Ownable_init();
        signaturesRegistry = keccak256(abi.encodePacked(_name));
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

    // Public Write functions

    /**
     * @notice Signs the pool with the borrower information.
     * It will advance the obligation to `active` state.
     * @dev The entities must grant permission to the obligation
     * contract to transfer funds on his behalf. Due to solidity
     * technical issue, the mentioned approval should be done on a
     * separate call.
     * The status mechanism in conjunction with entity signatures
     * grant the correct transition to the active state.
     */

    function activate() external onlyBorrower onlyPendingPool {
        bytes32 signedId = keccak256(abi.encodePacked(pool.name));

        require(
            signaturesRegistry !=
                keccak256(abi.encodePacked(_msgSender(), signedId)),
            "The borrower has already signed"
        );

        // require(
        //     obligation.svt.allowance(_msgSender(), address(this)) ==
        //         type(uint256).max,
        //     "Unauthorized to manage entity funds"
        // );

        _signActivate();

        if (signaturesRegistry != signedId) {
            _activate();
        }
    }


    // Private functions

    /**
     * @notice Provides the obligation current status.
     *
     * @return string Obligation status code.
     */
    function _status() public view returns (string memory) {
        string[] memory statusCode = new string[](4);
        statusCode[uint256(Status.Pending)] = "pending";
        statusCode[uint256(Status.Active)] = "active";
        statusCode[uint256(Status.Suspended)] = "suspended";
        statusCode[uint256(Status.Closed)] = "closed";

        return statusCode[uint256(pool.status)];
    }

    /**
     * @notice Activates the pool after borrower
     * sign the contract and approve the funds management.
     * Also, reactivates a suspended obligation.
     */
    function _activate() private {
        emit Active(
            pool.name,
            pool.borrower,
            pool.interestPeriod,
            pool.interestRate
        );

        pool.status = Status.Active;
    }

    /**
     * @notice Signs the registry with the activate obligation details.
     */
    function _signActivate() private {
        signaturesRegistry = keccak256(
            abi.encodePacked(_msgSender(), signaturesRegistry)
        );

        emit Sign(pool.name, _msgSender(), "activate", signaturesRegistry);
    }
}