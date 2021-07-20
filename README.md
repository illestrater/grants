# Sevens Foundation

[![Build Status](https://travis-ci.org/crsandeep/simple-react-full-stack.svg?branch=master)](https://travis-ci.org/crsandeep/simple-react-full-stack)


We are a non-profit organization dedicated to elevating artists. We provide a framework for curators and organizations to connect through art exhibitions and grants with charitable or benevolent intentions. We empower emerging artists by highlighting them, operating pro-bono, taking 0% profits, and providing a unique and innovative tool for collaboration.

- [Ethos](#ethos)
- [Quick Start](#quick-start)
  - [Configuring Project](#configuring-project)
- [Creator Royalties](#creator-royalties-standard)

## Ethos

Sevens Foundation was created by Tim Kang through the heart of Mike Darlington. We are a global committee and 501(c)3 non-profit organization with a mission to spotlight emerging artists and share their creativity with the world.

Since its inception, digital art as a medium has not received the respect or renown it deserves in the traditional fine art world. We believe this paradigm is at a crucial tipping point with the advent of blockchain technology designed to allow digital creations to be securely authenticated, sold and owned.

A talented and intrepid cast of artists have already entered the world of NFTs and are quickly establishing themselves in this burgeoning realm. As the space rapidly matures, the breadth of opportunity is expanding; the NFT community is primed to welcome more creative people and have them embrace the opportunity at hand.

Currently, the available resources for artists looking to become informed and take their first steps into this world are scattered, daunting, and expensive. Sevens Foundation will provide these tools and initial fundings to newcomers who are eager to participate and jump start their journey exploring their passion for creativity.

Sevens Foundation understands and shares the concerns regarding blockchains' carbon footprint; this will be resolved in the near future on a systemic level when platforms migrate to scalable solutions. In the meantime we will offset the emissions produced by each and every NFT we mint by planting trees in partnership with The Gold Standard. We are also deeply committed to equality and will focus on promoting and advancing the creative output of the BIPOC and LGBTQ+ communities.

We believe in a bright future for artistry across the globe, and we are excited to welcome others into this new era through our shared passion for art, music, and design.


## Quick Start

```bash
# Clone the repository
git clone https://github.com/illestrater/grants.git

# Go inside the directory
cd grants

# Install dependencies
yarn install

# Use correct node engine for OpenSea packages
nvm install 14.15.11
nvm use 14.15.11

# Start development server
yarn dev 

# Build for production
yarn build 

# Start production server
yarn start
```


### Configuring Project

Create an .env file with the following fields, starred* fields are optional to get up and running:

```
ENV = DEV
MONGO = <mongo driver>
JWT = DEVJWT
SSL_PATH = <ssl path (production only)*>
INFURA = <infura key*>
SPACES_SECRET = <digitalocean spaces CDN secret*>
SPACES_KEY = <digitalocean spaces CDN key*>
SES_PASS = <amazon simple email service pass*>
SES_USER = <amazon simple email service user*>
TWITTER_TOKEN = <twitter api token used for verifying profiles*>
WALLET = <service minter wallet address*>
WALLET_PRIVATE_KEY = <your private key for providing minting services on behalf of users*>
FACTORY_ADDRESS = 0xb5b933063331ed686bF0668a650e434164E637Ef
ETHERSCAN = <etherscan key for verifying factory deployed contracts*>
```

### Creator Royalties Standard

Located in contracts/Sevens.sol - Currently supported by Rarible and eventually OpenSea

```
contract HasSecondarySaleFees is ERC165 {
    // List of tokenIDs mapping to one or more creator splits
	mapping(uint256 => address payable[]) creatorAddresses;
	mapping(uint256 => uint256[]) creatorShares;

	bytes4 private constant _INTERFACE_ID_FEES = 0xb7799584;

	constructor() public {
		_registerInterface(_INTERFACE_ID_FEES);
	}

    // Recipient addresses 
	function getFeeRecipients(uint256 tokenId) external view returns (address payable[] memory){
		return creatorAddresses[tokenId];
	}

    // Percentage shares (1000 is equal to 10%)
	function getFeeBps(uint256 tokenId) external view returns (uint[] memory){
		return creatorShares[tokenId];
	}
}
```