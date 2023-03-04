// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract RandomNFT is ERC721, Ownable {
    uint256 public mintPrice;
    uint256 public totalSupply;
    uint256 public maxSupply;
    string public baseTokenUri;
    mapping(uint256 => string) private tokenIdIpfsHashs;
    mapping(string => uint256) private ipfsHashTokenIds;

    event Mint(address indexed owner, uint256 tokenId, string ipfsHash);
    event Withdraw(address indexed owner, uint256 amount);

    constructor() payable ERC721("RandomNFT", "RD") {
        mintPrice = 0.001 ether;
        totalSupply = 0;
        maxSupply = 1000;
        baseTokenUri = "https://gateway.pinata.cloud/ipfs/";
    }
    
    receive() external payable {}

    function setBaseTokenUri(string calldata _baseTokenUri) external onlyOwner {
        baseTokenUri = _baseTokenUri;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenUri;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        require(_exists(_tokenId), "ERC721: invalid token ID");
        return
            string(abi.encodePacked(baseTokenUri, tokenIdIpfsHashs[_tokenId]));
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Balance is zero");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");

        emit Withdraw(owner(), balance);
    }

    function mint(
        string calldata ipfsHash,
        bytes32 hashedData,
        bytes calldata signature
    ) public payable {
        require(msg.value >= mintPrice, "Insufficient ETH sent");
        require(totalSupply + 1 <= maxSupply, "Maximum supply reached");
        require(ipfsHashTokenIds[ipfsHash] == 0, "Already minted");

        address signer = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(hashedData),
            signature
        );

        require(signer == owner(), "Invalid signature");

        totalSupply++;
        uint256 tokenId = totalSupply;
        console.log("%s", tokenId);
        tokenIdIpfsHashs[tokenId] = ipfsHash;
        ipfsHashTokenIds[ipfsHash] = tokenId;
        _safeMint(msg.sender, tokenId);
        emit Mint(msg.sender, tokenId, ipfsHash);
    }
}
