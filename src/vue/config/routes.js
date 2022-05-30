import MainPage from '../pages/MainPage.vue';
import Blocks from '../pages/Blocks.vue';
import Block from '../pages/Block.vue';
import Transactions from '../pages/Transactions.vue';
import Transaction from '../pages/Transaction.vue';
import Tokens from '../pages/Tokens.vue';
import Token from '../pages/Token.vue';
import NFTs from '../pages/NFTs.vue';
import NFT from '../pages/NFT.vue';
import Account from '../pages/Account.vue';
import Consensus from '../pages/Consensus.vue';
import Search from '../pages/Search.vue';
import Register from '../pages/Register.vue';
// import Peers from '../pages/Peers.vue';

export default [
    { path: '/', component: MainPage },
    { path: '/blocks/', component: Blocks, name: 'blocks' },
    { path: '/block/:blockNoOrHash', component: Block, name: 'block'},
    { path: '/transactions/', component: Transactions, name: 'transactions' },
    { path: '/transaction/:hash', component: Transaction, name: 'transaction' },
    { path: '/tokens/', component: Tokens, name: 'tokens' },
    { path: '/token/:hash', component: Token, name: 'token' },
    { path: '/nfts/', component: NFTs, name: 'nfts' },
    { path: '/nft/:hash', component: NFT, name: 'nft' },
    { path: '/account/:address', component: Account, name: 'account' },
    { path: '/votes/', component: Consensus, name: 'votes' },
    { path: '/consensus/', component: Consensus, name: 'consensus' },
    { path: '/register/', component: Register, name: 'register' },
    { path: '/search', component: Search, name: 'search' },
    // { path: '/peers/', component: Peers, name: 'peers' },
];
