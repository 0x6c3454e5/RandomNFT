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
    mapping(uint256 => string) private tokenCid;
    mapping(string => uint256) private cidToken;

    event Mint(address indexed account, uint256 indexed tokenId, string metadata);
    event Withdraw(address indexed account, uint256 amount);

    constructor() payable ERC721("RandomNFT", "RD") {
        require(msg.sender == tx.origin, "Only externally owned accounts can create this contract.");
        mintPrice = 0.001 ether;
        totalSupply = 0;
        maxSupply = 1000;
        baseTokenUri = "https://cloudflare-ipfs.com/ipfs/";
    }

    receive() external payable {}

    function setBaseTokenUri(string calldata _baseTokenUri) external onlyOwner {
        baseTokenUri = _baseTokenUri;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        require(_exists(_tokenId), "ERC721: invalid token ID");
        return string(abi.encodePacked(baseTokenUri, tokenCid[_tokenId]));
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Balance is zero");
        payable(owner()).transfer(balance);
        emit Withdraw(owner(), balance);
    }

    function mint(
        string calldata cid,
        bytes32 cidHash,
        bytes calldata signature
    ) public payable {
        require(msg.value >= mintPrice, "Insufficient ETH sent");
        require(totalSupply + 1 <= maxSupply, "Maximum supply reached");
        require(cidToken[cid] == 0, "Already minted");

        address signer = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(cidHash),
            signature
        );
        require(signer == owner(), "Invalid signature");
        totalSupply++;
        uint256 tokenId = totalSupply;
        console.log("%s", tokenId);
        tokenCid[tokenId] = cid;
        cidToken[cid] = tokenId;
        _safeMint(msg.sender, tokenId);
        emit Mint(msg.sender, tokenId, tokenURI(tokenId));
    }
}
